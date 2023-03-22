import {
  CogniteExternalId,
  CogniteInternalId,
  DocumentGeoJsonGeometry,
  DocumentSourceFile,
  EpochTimestamp,
  LabelList,
  DocumentHighlight,
} from '@cognite/sdk';

import { MatchingLabels } from '../../types';

// Flattened version of 'DocumentSearchItem' from cognite/sdk
export interface InternalDocument {
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

export interface InternalDocumentWithMatchingLabels extends InternalDocument {
  matchingLabels?: MatchingLabels; // INFO: This is only optional for now, to not crash the legacy types -_-
}
