import { Timestamp, IdEither } from '@cognite/sdk';

export type InternalDocumentFilter = {
  author?: string[];
  source?: string[];
  mimeType?: string[];
  externalIdPrefix?: string;
  createdTime?: { min?: Timestamp; max?: Timestamp };
  lastUpdatedTime?: { min?: Timestamp; max?: Timestamp };
  assetSubtreeIds?: IdEither[];
};

export type Order = 'asc' | 'desc';

export type DocumentSort = {
  column?: string;
  order?: Order;
};
