import { Label } from '@cognite/sdk';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { BulkEditUnsavedState } from 'src/modules/Common/store/common/types';
import { DeleteAnnotationsAndHandleLinkedAssetsOfFile } from 'src/store/thunks/Review/DeleteAnnotationsAndHandleLinkedAssetsOfFile';
import { VisionFile } from 'src/modules/Common/store/files/types';
import { ThunkConfig } from 'src/store/rootReducer';
import { UpdateFiles } from './UpdateFiles';

export const updateBulk = createAsyncThunk<
  void,
  { selectedFiles: VisionFile[]; bulkEditUnsaved: BulkEditUnsavedState },
  ThunkConfig
>('updateBulk', async ({ selectedFiles, bulkEditUnsaved }, { dispatch }) => {
  const payload: {
    id: number;
    update: {};
  }[] = selectedFiles.map((file) => {
    const { id } = file;
    const addedLabels: Label[] = bulkEditUnsaved.labels || [];

    const updatedMetadata = bulkEditUnsaved.metadata;
    const newMetadata = updatedMetadata
      ? Object.keys(updatedMetadata)
          .filter((key) => !!updatedMetadata[key])
          .reduce(
            (res, key) => Object.assign(res, { [key]: updatedMetadata[key] }),
            {}
          )
      : {};

    return {
      id,
      update: {
        labels: { add: addedLabels },
        metadata: { add: newMetadata },
      },
    };
  });
  await dispatch(
    DeleteAnnotationsAndHandleLinkedAssetsOfFile({
      annotationIds: bulkEditUnsaved.annotationIdsToDelete || [],
      showWarnings: true,
    })
  );
  await dispatch(UpdateFiles(payload));
});
