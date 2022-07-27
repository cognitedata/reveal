export type DMSError = {
  error: {
    code: number;
    message: string;
  };
};
export type Response<T> = { status: number; data: { items: T[] } };
