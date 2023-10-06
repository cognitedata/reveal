import { createSelector } from '@reduxjs/toolkit';

import { RootState } from '../../store/rootReducer';
import { generateKeyValueArray } from '../../utils/FormatUtils';
import { selectFileById } from '../Common/store/files/selectors';

import {
  MetadataItem,
  VisionFileDetails,
} from './Components/FileMetadata/Types';
import { FileDetailsState, FileInfoValueState } from './types';

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
