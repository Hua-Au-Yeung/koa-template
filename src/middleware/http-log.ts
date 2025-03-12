import { logger } from '@root/src/module/logger.js';
import { Next, ParameterizedContext } from 'koa';

export const httpLog = async (ctx: ParameterizedContext, next: Next) => {
    await next();
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
};
