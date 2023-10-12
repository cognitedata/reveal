import { Label, Metadata } from '@cognite/sdk';

import { CDFStatusModes } from '../../Components/CDFStatus/CDFStatus';

export type AssetIds = {
  addedAssetIds?: number[];
  removedAssetIds?: number[];
};

export type AnnotationIds = {
  annotationIdsToDelete?: number[];
  verifiedAnnotationIds?: number[];
  rejectedAnnotationIds?: number[];
  unhandledAnnotationIds?: number[];
};

export type BulkEditUnsavedState = {
  metadata?: Metadata;
  keepOriginalMetadata?: boolean;
  labels?: Label[];
  assetIds?: AssetIds;
  annotationIds?: AnnotationIds;
  source?: string;
  directory?: string;
};

export type CommonState = {
  showFileDownloadModal: boolean;
  showBulkEditModal: boolean;
  bulkEditUnsavedState: BulkEditUnsavedState;
  saveState: {
    mode: CDFStatusModes;
    time?: number;
  };
};
