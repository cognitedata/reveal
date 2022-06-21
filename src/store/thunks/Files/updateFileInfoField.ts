import { createAsyncThunk } from '@reduxjs/toolkit';
import { VisionFile } from 'src/modules/Common/store/files/types';
import { ThunkConfig } from 'src/store/rootReducer';
import { Label, Metadata } from '@cognite/sdk';
import isEqual from 'lodash-es/isEqual';
import { UpdateFiles } from 'src/store/thunks/Files/UpdateFiles';

export const updateFileInfoField = createAsyncThunk<
  void,
  { fileId: number; key: string },
  ThunkConfig
>('updateFileInfoField', async ({ fileId, key }, { getState, dispatch }) => {
  if (!fileId) {
    throw new Error('Id not provided!');
  }

  const fileState = getState().fileReducer;
  const fileMetadataState = getState().fileDetailsSlice;

  const fileDetails = fileState.files.byId[fileId];

  if (!fileDetails) {
    return;
  }
  const editedFileDetails = fileMetadataState.fileDetails;

  if (key) {
    let updateInfoSet = {};

    switch (key) {
      case 'labels': {
        if (!Object.keys(editedFileDetails).includes(key)) {
          return;
        }
        const newLabels = (editedFileDetails[key] as Label[]) || [];
        const existingLabels: Label[] =
          (fileDetails && fileDetails.labels) || [];
        const addedLabels: Label[] = [];
        const removedLabels: Label[] = [];
        existingLabels.forEach((existingLbl) => {
          const found = newLabels.find(
            (newLabel) => existingLbl.externalId === newLabel.externalId
          );
          if (!found) {
            removedLabels.push(existingLbl);
          }
        });
        newLabels.forEach((newLbl) => {
          const found = existingLabels.find(
            (existingLbl) => existingLbl.externalId === newLbl.externalId
          );
          if (!found) {
            addedLabels.push(newLbl);
          }
        });
        updateInfoSet = {
          [key]: { add: addedLabels, remove: removedLabels },
        };
        break;
      }
      case 'assetIds': {
        if (!Object.keys(editedFileDetails).includes(key)) {
          return;
        }
        const newAssetIds = (editedFileDetails[key] as number[]) || [];
        const existingAssetIds: number[] =
          (fileDetails && fileDetails.assetIds) || [];
        const addedAssetIds: number[] = [];
        const removedAssetIds: number[] = [];
        existingAssetIds.forEach((existingAssetId) => {
          const found = newAssetIds.find(
            (newAssetId) => existingAssetId === newAssetId
          );
          if (!found) {
            removedAssetIds.push(existingAssetId);
          }
        });
        newAssetIds.forEach((newAssetId) => {
          const found = existingAssetIds.find(
            (existingAssetId) => existingAssetId === newAssetId
          );
          if (!found) {
            addedAssetIds.push(newAssetId);
          }
        });
        updateInfoSet = {
          [key]: { add: addedAssetIds, remove: removedAssetIds },
        };
        break;
      }
      case 'metadata': {
        const metadata: Metadata = {};

        const editedFileMeta = fileMetadataState.fileMetaData;
        const metaKeys = Object.keys(editedFileMeta);

        metaKeys.forEach((rowId) => {
          const row = editedFileMeta[parseInt(rowId, 10)];
          metadata[row.metaKey] = row.metaValue.toString();
        });

        if (isEqual(metadata, fileDetails?.metadata)) {
          return;
        }

        updateInfoSet = {
          [key]: { set: metadata },
        };
        break;
      }
      default: {
        const value = editedFileDetails[key];
        if (
          !Object.keys(editedFileDetails).includes(key) ||
          isEqual(value, fileDetails[key as keyof VisionFile])
        ) {
          return;
        }
        if (value === undefined || value === '' || value === null) {
          updateInfoSet = { [key]: { setNull: true } };
        } else {
          updateInfoSet = { [key]: { set: value } };
        }
      }
    }

    const payload = [{ id: fileId, update: updateInfoSet }];

    await dispatch(UpdateFiles(payload));

    return;
  }
  throw new Error('Update Data is Empty!');
});
