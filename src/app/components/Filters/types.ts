import { DateRange, IdEither, Metadata } from '@cognite/sdk';

// Use the types from provider instead
export type CommonFilterFacets = {
  dataSetIds?: IdEither[];
  createdTime?: DateRange;
  lastUpdatedTime?: DateRange;
  assetSubtreeIds?: IdEither[];
  metadata?: Metadata;
  externalIdPrefix?: string;
};
