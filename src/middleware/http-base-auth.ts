import { Next, ParameterizedContext } from 'koa';
import auth from 'koa-basic-auth';
import { env } from 'process';

export const httpBaseAuth = (credentials: { name: string; pass: string; }) => {
    return async (ctx: ParameterizedContext, next: Next) => {
        try {
            await auth(credentials)(ctx, next);
        } catch (err) {
            if (!(err as KoaCtxError)) throw err;
            if ((err as KoaCtxError).status === 401) {
                ctx.status = 401;
                ctx.set('WWW-Authenticate', `Basic realm="NodeAgent[${env.NODE_ID}] Area"`);
                ctx.body = `NodeAgent[${env.NODE_ID}] Unauthorized\n`;
            } else {
                throw err;
            }
        }
    };
};
