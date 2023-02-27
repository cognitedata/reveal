export interface ItemList<T> {
  items: T[];
}

export interface ItemsWithCursor<T> extends ItemList<T> {
  nextCursor: string;
}
