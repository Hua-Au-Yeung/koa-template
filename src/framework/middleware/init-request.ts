import { logger } from '@framework/module/logger.js';
import crypto from 'crypto';
import { Next, ParameterizedContext } from 'koa';
import { DateTime } from 'luxon';
import { env } from 'process';

export const initRequest = async (ctx: ParameterizedContext<_BASEState, _BASEContext>, next: Next) => {
    ctx.state.currentMiddleware = 'framework/init-request';
    ctx.state.requestId = crypto.randomBytes(8).toString('hex');
    ctx.state.requestTimestamp = Date.now();
    logger.info(`🚀 Request[ID:${ctx.state.requestId} Starting`, { file: 'framework' });

    try {
        await next();
    } catch (err) {
        let error = err;

        // for http
        if (typeof err === 'object' && err !== null && 'status' in err && 'message' in err) {
            let error = err as _KoaError;
            ctx.status = error.status || 500;
            if (JSON.parse(env.DEBUG || 'false')) {
                error.expose = true;
            }

            if (error.expose && ctx.body === undefined) {
                ctx.body = error.message;
            }

            // 401 force Basic realm
            if (ctx.status == 401) {
                ctx.set('WWW-Authenticate', 'Basic realm="Protected Area"');
            }
        } else {
            ctx.status = 500;
            if (JSON.parse(env.DEBUG || 'false')) {
                ctx.body = typeof err === 'object' ? err?.toString() + '\n' : err;
            } else {
                ctx.body = `500 Internal Server Error, ID:${ctx.state.requestId}\n`;
            }
        }

        // for error event
        if (typeof err === 'object' && err !== null && 'status' in err) {
            let error = err as _KoaError;
            if (error.status >= 500) {
                ctx.app.emit('error', error, ctx);
            }
        } else {
            ctx.app.emit('error', error, ctx);
        }
    }

    let logLevel: string;
    switch (ctx.response.status.toString().substring(0, 1)) {
        case '2':
        case '3':
            logLevel = 'info';
            break;
        case '4':
            logLevel = 'warn';
            break;
        case '5':
            logLevel = 'error';
            break;
        default:
            logLevel = 'info';
    }
    ctx.set('Request-Id', ctx.state.requestId);
    logger.log(logLevel, `${ctx.ip} - ${ctx.request.method} - ${ctx.response.status} - ${ctx.request.url}`, {
        file: 'http',
        requestId: ctx.state.requestId,
        ip: ctx.ip,
        timestamp: DateTime.fromMillis(ctx.state.requestTimestamp).toFormat('yyyy-MM-dd HH:mm:ss'),
        duration: Date.now() - ctx.state.requestTimestamp,
    });
    logger.info(`✅ Request[ID:${ctx.state.requestId} Ended`, { file: 'framework' });
};
