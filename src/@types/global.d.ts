declare global {
    interface KoaCtxError extends Error {
        status: number;
    }
}
export {};
