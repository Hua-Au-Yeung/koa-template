declare global {
    // HttpError in package http-errors
    interface KoaCtxError extends Error {
        status: number;
    }

    interface MYState {
        requestId: string;
    }

    interface MYContext {
    }
}
export {};
