export interface MatchingLabels {
  exact: string[];
  partial: string[];
  fuzzy: string[];
}

export type Order = 'asc' | 'desc';

export type InternalSortBy = {
  property: string[];
  order: Order;
};

export type TableSortBy = {
  id: string;
  desc: boolean;
};

export interface MatchingLabels {
  exact: string[];
  partial: string[];
  fuzzy: string[];
}
