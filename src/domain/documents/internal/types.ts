import {
  CogniteExternalId,
  CogniteInternalId,
  DocumentGeoJsonGeometry,
  DocumentSourceFile,
  EpochTimestamp,
  LabelList,
  DocumentHighlight,
} from '@cognite/sdk';
import { IdEither, DateRange } from '@cognite/sdk';

// Flattened version of 'DocumentSearchItem' from cognite/sdk
export interface Document {
  id: CogniteInternalId;
  externalId?: CogniteExternalId;
  name?: string;
  title?: string;
  author?: string;
  createdTime: EpochTimestamp;
  modifiedTime?: EpochTimestamp;
  lastIndexedTime?: EpochTimestamp;
  mimeType?: string;
  extension?: string;
  pageCount?: number;
  type?: string;
  language?: string;
  truncatedContent?: string;
  assetIds?: CogniteInternalId[];
  labels?: LabelList;
  sourceFile: DocumentSourceFile;
  geoLocation?: DocumentGeoJsonGeometry;
  highlight?: DocumentHighlight;
}

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
