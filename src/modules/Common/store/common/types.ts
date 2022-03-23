import { Label, Metadata } from '@cognite/sdk';
import { CDFStatusModes } from 'src/modules/Common/Components/CDFStatus/CDFStatus';

export type AssetIds = {
  addedAssetIds?: number[];
  removedAssetIds?: number[];
};

export type BulkEditUnsavedState = {
  metadata?: Metadata;
  keepOriginalMetadata?: Boolean;
  labels?: Label[];
  assetIds?: AssetIds;
  annotationIdsToDelete?: number[];
};

export type CommonState = {
  showFileDownloadModal: boolean;
  showBulkEditModal: boolean;
  showModelTrainingModal: boolean;
  bulkEditUnsavedState: BulkEditUnsavedState;
  saveState: {
    mode: CDFStatusModes;
    time?: number;
  };
};
