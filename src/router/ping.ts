import { Next, ParameterizedContext } from 'koa';

export const ping = async (ctx: ParameterizedContext, next: Next) => {
    ctx.body = 'pong\n';
};
