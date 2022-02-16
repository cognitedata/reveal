export type ItemsWithCursor<T> = {
  items: T[];
  nextCursor: string | null;
};
