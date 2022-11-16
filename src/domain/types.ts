import { DateRange } from '@cognite/sdk';

export type InternalCommonFilters = {
  assetSubtreeIds?: { label?: string; value: number }[];
  dataSetIds?: { label?: string; value: number }[];
  // metadata?: Metadata;
  createdTime?: DateRange;
  lastUpdatedTime?: DateRange;
  externalIdPrefix?: string;
  internalId?: number;
};

export type Order = 'asc' | 'desc';

export type InternalSortBy = {
  property: string;
  order: Order;
};
