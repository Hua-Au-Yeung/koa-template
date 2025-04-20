import { DefaultContext, DefaultState } from 'koa';

declare global {
    // HttpError in package http-errors
    interface _KoaError extends Error {
        status: number;
        expose: boolean;
    }

    interface _BASEState extends DefaultState {
        requestId: string;
        requestTimestamp: number;
        currentMiddleware: string;
    }
    interface _BASEContext extends DefaultContext {
    }

    interface LauncherOptions {
        url_prefix?: string;
    }
}
export {};
