export type DMSError = { status: number };
export type Response<T> = { status: number; data: { items: T[] } };
