import { Next, ParameterizedContext } from 'koa';

export const template = async (ctx: ParameterizedContext<_BASEState, _BASEContext>, next: Next) => {
    await next();
};
