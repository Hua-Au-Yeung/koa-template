import { logger } from '@framework/module/logger.js';
import crypto from 'crypto';
import { Next, ParameterizedContext } from 'koa';

export const initRequest = async (ctx: ParameterizedContext<_BASEState, _BASEContext>, next: Next) => {
    ctx.state.requestId = crypto.randomBytes(8).toString('hex');
    let logLevel: string;
    switch (ctx.response.status.toString().substring(0, 1)) {
        case '2':
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
    });
    await next();
};
