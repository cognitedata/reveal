export type Order = 'asc' | 'desc';

export type InternalSortBy = {
  property: string;
  order: Order;
};
