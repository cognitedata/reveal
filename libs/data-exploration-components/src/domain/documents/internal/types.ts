import {
  CogniteExternalId,
  CogniteInternalId,
  DocumentGeoJsonGeometry,
  DocumentSourceFile,
  EpochTimestamp,
  LabelList,
  DocumentHighlight,
} from '@cognite/sdk';
import { InternalCommonFilters } from '../../types';

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

export interface InternalDocumentFilter extends InternalCommonFilters {
  author?: string[];
  source?: string[];
  type?: string[];
  metadata?: { key: string; value: string }[];
}
