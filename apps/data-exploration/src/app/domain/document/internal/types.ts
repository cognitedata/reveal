import { IdEither, DateRange, Metadata } from '@cognite/sdk';

// TODO: Remove this type and get the exported type from data-exploration component library
export type InternalDocumentFilter = {
  author?: string[];
  source?: string[];
  mimeType?: string[];
  externalIdPrefix?: string;
  createdTime?: DateRange;
  lastUpdatedTime?: DateRange;
  assetSubtreeIds?: IdEither[];
  metadata?: Metadata;
};

export type Order = 'asc' | 'desc';

export type DocumentSort = {
  column?: string;
  order?: Order;
};
