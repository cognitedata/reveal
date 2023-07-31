export type DMSError = {
  error: {
    code: number;
    message: string;
  };
};
export type Response<T> = { status: number; data: { items: T[] } };

type Field = Record<string, boolean | string | number>;
export type DMSModel = {
  externalId: string;
  properties: Record<string, Field>;
};
