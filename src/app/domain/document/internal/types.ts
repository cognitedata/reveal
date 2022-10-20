import { IdEither, DateRange } from '@cognite/sdk';

export type InternalDocumentFilter = {
  author?: string[];
  source?: string[];
  mimeType?: string[];
  externalIdPrefix?: string;
  createdTime?: DateRange;
  lastUpdatedTime?: DateRange;
  assetSubtreeIds?: IdEither[];
};

export type Order = 'asc' | 'desc';

export type DocumentSort = {
  column?: string;
  order?: Order;
};
