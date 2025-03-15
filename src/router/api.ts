import Router from '@koa/router';
import { httpBaseAuth } from '@root/src/middleware/http-base-auth.js';
import { ParameterizedContext } from 'koa';
import bodyParser from 'koa-bodyparser';
import { env } from 'process';

export const apiRouter = new Router<MYState, MYContext>();

apiRouter
    .use(bodyParser());

apiRouter.get('/', async (ctx: ParameterizedContext<MYState, MYContext>) => {
    ctx.body = 'ok\n';
});

apiRouter.get(
    '/ping',
    httpBaseAuth({
        name: env.HTTP_BASIC_AUTH_USERNAME as string,
        pass: env.HTTP_BASIC_AUTH_PASSWORD as string,
    }),
    async (ctx: ParameterizedContext<MYState, MYContext>) => {
        ctx.body = 'pong\n';
    },
);
