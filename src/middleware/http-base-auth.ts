import { Next, ParameterizedContext } from 'koa';
import auth from 'koa-basic-auth';
import { env } from 'process';

export const httpBaseAuth = (credentials: { name: string; pass: string; }) => {
    return async (ctx: ParameterizedContext, next: Next) => {
        try {
            await auth(credentials)(ctx, next); // 里面有 return next(); return Promise object
        } catch (err) {
            // @ts-ignore
            if (err.status === 401) {
                ctx.status = 401;
                ctx.set('WWW-Authenticate', `Basic realm="NodeAgent[${env.NODE_ID}] Area"`);
                ctx.body = `NodeAgent[${env.NODE_ID}] Unauthorized\n`;
            } else {
                throw err; // 不然会404
            }
        }
    };
};
