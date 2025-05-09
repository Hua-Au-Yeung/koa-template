import '@framework/init';
import { initRequest } from '@framework/middleware/init-request.js';
import { logger } from '@framework/module/logger.js';
import { mainRouter as _mainRouter } from '@framework/router/main.js';
import Router from '@koa/router';
import fs from 'fs';
import http from 'http';
import https from 'https';
import Koa, { Middleware, ParameterizedContext } from 'koa';
import { env } from 'process';

const hostname = env.HOST as string;
const port = parseInt(env.PORT as string);

const framework_middlewares = [
    'framework/init-request',
    'framework/http-base-auth',
];

class Launcher<StateT extends _BASEState, CotextT extends _BASEContext> {
    public server: http.Server | https.Server | undefined;
    public app: Koa<StateT, CotextT> = new Koa<StateT, CotextT>();
    public mainRouter: Router<_BASEState, _BASEContext> = _mainRouter;
    private middlewares: Middleware<StateT, CotextT>[] = [];

    public constructor(options: LauncherOptions) {
        if (options.proxy) {
            this.app.proxy = options.proxy;
        }
        if (options.url_prefix) {
            this.mainRouter.prefix(options.url_prefix);
        }
    }

    public addRouter(...args: any[]) {
        this.mainRouter.use(...args);
        return this;
    }

    public useMiddlewares() {
        this.app.use(initRequest);

        this.middlewares.forEach(middleware => {
            this.app.use(middleware);
        });

        this.app
            .use(this.mainRouter.routes())
            .use(this.mainRouter.allowedMethods())
            .on('error', (err, ctx: ParameterizedContext<StateT, CotextT>) => {
                if (ctx) {
                    const logMeta: Record<any, any> = {
                        requestId: ctx.state.requestId,
                        ip: ctx.ip,
                    };
                    if (framework_middlewares.includes(ctx.state.currentMiddleware)) {
                        logMeta['file'] = 'framework';
                    }

                    if (ctx.status < 500) {
                        logger.warn(`⚠️ Error Event: ${err.toString().trim()}`, logMeta);
                    } else {
                        logger.error(`❌ Error Event: ${err.toString().trim()}`, logMeta);
                    }
                } else {
                    // global error or other
                    logger.error(`‼️ Global ️Error Event: ${err.toString().trim()}`);
                }
            });
        return this;
    }
    public serverListen(listeningListener?: () => void) {
        // https or http
        if (JSON.parse(env.SSL || 'false')) {
            const options = {
                key: fs.readFileSync(env.SSL_KEY as string),
                cert: fs.readFileSync(env.SSL_CERT as string),
            };
            this.server = https.createServer(options, this.app.callback()).listen(port, hostname, () => {
                logger.info(`HTTPS server is running on https://${hostname}:${port}`, { file: 'framework' });
                if (listeningListener) {
                    listeningListener();
                }
            });
        } else {
            this.server = this.app.listen(port, hostname, () => {
                logger.info(`HTTP server is running on http://${hostname}:${port}`, { file: 'framework' });
                if (listeningListener) {
                    listeningListener();
                }
            });
        }
    }

    public addMiddleware(middleware: Middleware<StateT, CotextT>) {
        this.middlewares.push(middleware);
        return this;
    }
}

export default Launcher;
