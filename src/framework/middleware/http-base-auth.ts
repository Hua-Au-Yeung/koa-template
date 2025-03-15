import { Next, ParameterizedContext } from 'koa';
import auth from 'koa-basic-auth';

export const httpBaseAuth = (credentials: { name: string; pass: string; }) => {
    return async (ctx: ParameterizedContext<_BASEState, _BASEContext>, next: Next) => {
        try {
            await auth(credentials)(ctx, next);
        } catch (err) {
            // @ts-ignore
            ctx.status = err.status || 500;
            ctx.body = (err as Error).message;
            ctx.app.emit('error', err, ctx);
        }
    };
};
