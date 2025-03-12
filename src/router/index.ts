import { Next, ParameterizedContext } from 'koa';

export const index = async (ctx: ParameterizedContext, next: Next) => {
    ctx.body = 'ok\n';
};
