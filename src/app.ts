import './init';
import Router from '@koa/router';
import fs from 'fs';
import https from 'https';
import Koa, { ParameterizedContext } from 'koa';
import bodyParser from 'koa-bodyparser';
import { env } from 'process';
import { httpBaseAuth } from './middleware/http-base-auth.js';
import { httpInit } from './middleware/http-init.js';
import { httpLog } from './middleware/http-log.js';
import { logger } from './module/logger.js';
import { index as indexRouter } from './router/index.js';
import { ping as pingRouter } from './router/ping.js';

const hostname = env.HOST as string;
const port = parseInt(env.PORT as string);

const app = new Koa();
app.proxy = true;
const router = new Router();

(async () => {
    const credentials = {
        name: env.HTTP_BASIC_AUTH_USERNAME as string,
        pass: env.HTTP_BASIC_AUTH_PASSWORD as string,
    };

    router.get('/', indexRouter)
        .get('/ping', httpBaseAuth(credentials), pingRouter);

    app.use(httpInit)
        .use(httpLog)
        .use(bodyParser())
        .use(router.routes())
        .use(router.allowedMethods())
        .on('error', (err, ctx: ParameterizedContext) => {
            logger.error(`Server Error: ${err.toString().trim()}`, {
                requestId: ctx.state.requestId,
                ip: ctx.ip,
            });
        });

    if (env.SSL == 'true') {
        const options = {
            key: fs.readFileSync(env.SSL_KEY as string),
            cert: fs.readFileSync(env.SSL_CERT as string),
        };
        https.createServer(options, app.callback()).listen(port, hostname, () => {
            logger.info(`HTTPS server is running on https://${hostname}:${port}`);
        });
    } else {
        app.listen(port, hostname, () => {
            logger.info(`HTTP server is running on http://${hostname}:${port}`);
        });
    }
})();
