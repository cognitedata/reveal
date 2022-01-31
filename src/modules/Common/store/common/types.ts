import { Label, Metadata } from '@cognite/sdk';
import { CDFStatusModes } from 'src/modules/Common/Components/CDFStatus/CDFStatus';

export type BulkEditUnsavedState = {
  metadata?: Metadata;
  keepOriginalMetadata?: Boolean;
  labels?: Label[];
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
