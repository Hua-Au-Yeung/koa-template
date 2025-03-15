import Router from '@koa/router';
import { ParameterizedContext } from 'koa';

export const mainRouter = new Router<MYState, MYContext>();

mainRouter.get('/', async (ctx: ParameterizedContext<MYState, MYContext>) => {
    ctx.body = 'Hello KoaJS!\n';
});
