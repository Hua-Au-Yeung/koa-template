import '@framework/init';
import { initRequest } from '@framework/middleware/init-request.js';
import { logger } from '@framework/module/logger.js';
import { mainRouter } from '@framework/router/main.js';
import Router from '@koa/router';
import fs from 'fs';
import https from 'https';
import Koa, { ParameterizedContext } from 'koa';
import { env } from 'process';

const hostname = env.HOST as string;
const port = parseInt(env.PORT as string);

const _app = new Koa<_BASEState, _BASEContext>();
_app.proxy = true;

class Launcher {
    public mainRouter: Router<_BASEState, _BASEContext> = mainRouter;
    public app: Koa<_BASEState, _BASEContext> = _app;
    public __construct() {
    }
    public async run() {
        this.app.use(initRequest)
            .use(mainRouter.routes())
            .use(mainRouter.allowedMethods())
            .on('error', (err, ctx: ParameterizedContext<_BASEState, _BASEContext>) => {
                logger.error(`ON Error: ${err.toString().trim()}`, {
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
            https.createServer(options, this.app.callback()).listen(port, hostname, () => {
                logger.info(`HTTPS server is running on https://${hostname}:${port}`);
            });
        } else {
            this.app.listen(port, hostname, () => {
                logger.info(`HTTP server is running on http://${hostname}:${port}`);
            });
        }
    }
}

const launcher = new Launcher();

export default launcher;
