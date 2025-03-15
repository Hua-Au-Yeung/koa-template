import { Next, ParameterizedContext } from 'koa';
import auth from 'koa-basic-auth';

export const httpBaseAuth = (credentials: { name: string; pass: string; }) => {
    return async (ctx: ParameterizedContext<_BASEState, _BASEContext>, next: Next) => {
        ctx.state.currentMiddleware = 'framework/http-base-auth';
        await auth(credentials)(ctx, next);
    };
};
