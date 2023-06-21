import { createSelector } from '@reduxjs/toolkit';
import {
  FileDetailsState,
  FileInfoValueState,
} from 'src/modules/FileDetails/types';
import {
  MetadataItem,
  VisionFileDetails,
} from 'src/modules/FileDetails/Components/FileMetadata/Types';
import { generateKeyValueArray } from 'src/utils/FormatUtils';
import { selectFileById } from 'src/modules/Common/store/files/selectors';
import { RootState } from 'src/store/rootReducer';

export const metadataEditMode = (state: FileDetailsState): boolean =>
  state.metadataEdit;

export const editedFileDetails = (
  state: FileDetailsState
): Record<string, FileInfoValueState> => state.fileDetails;

export const editedFileMeta = (
  state: FileDetailsState
): Record<number, MetadataItem> => state.fileMetaData;

export const selectUpdatedFileDetails = createSelector(
  (state: RootState) => editedFileDetails(state.fileDetailsSlice),
  (state: RootState, id: number) => selectFileById(state.fileReducer, id),
  (editedInfo, fileInfo) => {
    if (fileInfo) {
      const mergedInfo: VisionFileDetails = {
        ...fileInfo,
        ...editedInfo,
      };
      return mergedInfo;
    }
    return null;
  }
);

export const selectUpdatedFileMeta = createSelector(
  (state: RootState) => editedFileMeta(state.fileDetailsSlice),
  (state: RootState, id: number) => selectFileById(state.fileReducer, id),
  (editedMeta, fileInfo) => {
    let metadata: MetadataItem[] = generateKeyValueArray(fileInfo?.metadata);

    if (Object.keys(editedMeta).length > 0) {
      metadata = Object.values(editedMeta);
    }
    return metadata;
  }
);
