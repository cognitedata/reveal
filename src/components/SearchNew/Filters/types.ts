import { DateRange, IdEither, Metadata } from '@cognite/sdk';

export type CommonFilterFacets = {
  dataSetIds?: IdEither[];
  createdTime?: DateRange;
  lastUpdatedTime?: DateRange;
  assetSubtreeIds?: IdEither[];
  metadata?: Metadata;
  externalIdPrefix?: string;
};
