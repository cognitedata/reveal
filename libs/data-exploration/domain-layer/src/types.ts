export interface MatchingLabels {
  exact: string[];
  partial: string[];
  fuzzy: string[];
}

export type Order = 'asc' | 'desc';

export type InternalSortBy = {
  property: string[];
  order?: Order;
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

export type AggregateFilters = {
  aggregateFilter?: { prefix: { value: string } };
};

export interface RelationshipLabels {
  relationshipLabels?: string[];
  relation?: string;
  relatedResourceType?: string;
}
