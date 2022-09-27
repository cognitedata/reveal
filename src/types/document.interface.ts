import {
  CogniteExternalId,
  CogniteInternalId,
  DocumentGeoJsonGeometry,
  DocumentSourceFile,
  EpochTimestamp,
  LabelList,
} from '@cognite/sdk';
import { DocumentHighlight } from '@cognite/sdk/dist/src/api/documents/types.gen';

export interface Document {
  id: CogniteInternalId;
  externalId?: CogniteExternalId;
  name?: string;
  author?: string;
  createdTime: EpochTimestamp;
  lastUpdatedTime?: EpochTimestamp;
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
