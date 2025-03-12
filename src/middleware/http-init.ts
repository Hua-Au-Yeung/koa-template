import crypto from 'crypto';
import { Next, ParameterizedContext } from 'koa';

export const httpInit = async (ctx: ParameterizedContext, next: Next) => {
    ctx.state.requestId = crypto.randomBytes(8).toString('hex');
    await next();
};
