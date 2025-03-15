import '@root/src/init';
import { requestInit } from '@root/src/middleware/request-init.js';
import { logger } from '@root/src/module/logger.js';
import { apiRouter } from '@root/src/router/api.js';
import { mainRouter } from '@root/src/router/main.js';

import fs from 'fs';
import https from 'https';
import Koa, { ParameterizedContext } from 'koa';
import { env } from 'process';

const hostname = env.HOST as string;
const port = parseInt(env.PORT as string);

const app = new Koa<MYState, MYContext>();
app.proxy = true;

(async () => {
    mainRouter.use('/api', apiRouter.routes(), apiRouter.allowedMethods());

    app.use(requestInit)
        .use(mainRouter.routes())
        .use(mainRouter.allowedMethods())
        .on('error', (err, ctx: ParameterizedContext<MYState, MYContext>) => {
            logger.error(`Server Error: ${err.toString().trim()}`, {
                requestId: ctx.state.requestId,
                ip: ctx.ip,
            });
        });

    // https or http
    if (env.SSL === 'true') {
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
