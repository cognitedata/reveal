import {
  createSelector,
  createSlice,
  PayloadAction,
  isFulfilled,
  isRejected,
} from '@reduxjs/toolkit';
import {
  Asset,
  FileGeoLocation,
  FileInfo,
  Label,
  Metadata,
} from '@cognite/cdf-sdk-singleton';
import { ToastUtils } from 'src/utils/ToastUtils';
import { createFileInfo, createFileState } from 'src/store/util/StateUtils';
import { UpdateFiles } from 'src/store/thunks/UpdateFiles';
import { deleteFilesById } from 'src/store/thunks/deleteFilesById';
import { SaveAnnotations } from 'src/store/thunks/SaveAnnotations';
import { RetrieveAnnotations } from 'src/store/thunks/RetrieveAnnotations';
import { DeleteAnnotations } from 'src/store/thunks/DeleteAnnotations';
import { UpdateAnnotations } from 'src/store/thunks/UpdateAnnotations';
import { setSelectedAllFiles } from 'src/store/commonActions';
import { makeReducerSelectAllFilesWithFilter } from 'src/store/commonReducers';
import { SaveAnnotationTemplates } from 'src/store/thunks/SaveAnnotationTemplates';
import { CDFStatusModes } from '../Common/Components/CDFStatus/CDFStatus';

export type VisionAsset = Omit<
  Asset,
  'createdTime' | 'lastUpdatedTime' | 'sourceCreatedType'
> & { createdTime: number; lastUpdatedTime: number };

export type FileState = {
  id: number;
  createdTime: number;
  lastUpdatedTime: number;
  sourceCreatedTime?: number;
  mimeType?: string;
  name: string;
  source?: string;
  uploaded: boolean;
  uploadedTime?: number;
  labels?: Label[];
  metadata?: Metadata;
  linkedAnnotations: string[];
  assetIds?: number[];
  geoLocation?: FileGeoLocation;
};

export type State = {
  dataSetIds?: number[];
  extractExif?: boolean;
  allFilesStatus?: boolean;
  files: {
    byId: Record<number, FileState>;
    allIds: number[];
    selectedIds: number[];
  };
  saveState: {
    mode: CDFStatusModes;
    time?: number;
  };
};

const initialState: State = {
  dataSetIds: undefined,
  extractExif: true,
  allFilesStatus: false,
  // eslint-disable-next-line global-require
  // files: require('src/store/fakeFiles.json'),

  files: {
    byId: {},
    allIds: [],
    selectedIds: [],
  },
  saveState: {
    mode: 'saved' as CDFStatusModes,
    time: new Date().getTime(),
  },
};

export const selectCDFState = (
  state: State
): {
  mode: CDFStatusModes;
  time?: number | undefined;
} => {
  const cdfSaveStatus = state.saveState;
  return cdfSaveStatus;
};

const filesSlice = createSlice({
  name: 'filesSlice',
  initialState,
  /* eslint-disable no-param-reassign */
  reducers: {
    setFiles: {
      prepare: (files: FileInfo[]) => {
        return { payload: files.map((file) => createFileState(file)) };
      },
      reducer: (state, action: PayloadAction<FileState[]>) => {
        const files = action.payload;
        clearFileState(state);

        files.forEach((file) => {
          updateFileState(state, file);
        });
      },
    },
    addFiles: {
      prepare: (files: FileState[]) => {
        return { payload: files };
      },
      reducer: (state, action: PayloadAction<FileState[]>) => {
        const files = action.payload;

        files.forEach((file) => {
          updateFileState(state, file);
        });
      },
    },
    setUploadedFiles: {
      prepare: (files: FileInfo[]) => {
        return { payload: files.map((file) => createFileState(file)) };
      },
      reducer: (state, action: PayloadAction<FileState[]>) => {
        const files = action.payload;
        clearFileState(state);

        files.forEach((file) => {
          updateFileState(state, file);
        });
      },
    },
    addFileInfo: {
      prepare: (file: FileInfo) => {
        return { payload: createFileState(file) };
      },
      reducer: (state, action: PayloadAction<FileState>) => {
        updateFileState(state, action.payload);
      },
    },
    setAllFilesStatus(state, action: PayloadAction<boolean>) {
      state.allFilesStatus = action.payload;
    },
    setDataSetIds(state, action: PayloadAction<number[] | undefined>) {
      state.dataSetIds = action.payload;
    },
    setExtractExif(state, action: PayloadAction<boolean>) {
      state.extractExif = action.payload;
    },
    setFileSelectState: {
      prepare: (id: number, selected: boolean) => {
        return { payload: { fileId: id, selectState: selected } };
      },
      reducer: (
        state,
        action: PayloadAction<{ fileId: number; selectState: boolean }>
      ) => {
        const { fileId } = action.payload;
        if (fileId) {
          const alreadySelected = state.files.selectedIds.includes(fileId);
          if (alreadySelected) {
            const index = state.files.selectedIds.findIndex(
              (id) => id === fileId
            );
            state.files.selectedIds.splice(index, 1);
          } else {
            state.files.selectedIds.push(fileId);
          }
        }
      },
    },
    setSelectedFiles: {
      prepare: (id: number[]) => {
        return { payload: { fileIds: id } };
      },
      reducer: (state, action: PayloadAction<{ fileIds: number[] }>) => {
        const { fileIds } = action.payload;
        state.files.selectedIds = fileIds;
      },
    },
  },
  extraReducers: (builder) => {
    builder.addCase(deleteFilesById.fulfilled, (state, { payload }) => {
      payload.forEach((fileId) => {
        deleteFileById(state, fileId.id);
        state.files.selectedIds = state.files.selectedIds.filter(
          (id) => id !== fileId.id
        );
      });
    });

    builder.addCase(UpdateFiles.fulfilled, (state, { payload }) => {
      payload.forEach((fileState) => {
        updateFileState(state, fileState);
      });
    });

    builder.addCase(setSelectedAllFiles, makeReducerSelectAllFilesWithFilter());

    builder.addMatcher(
      isFulfilled(
        SaveAnnotations,
        DeleteAnnotations,
        UpdateAnnotations,
        UpdateFiles
      ),
      (state) => {
        state.saveState.mode = 'timestamp';
        state.saveState.time = new Date().getTime();
      }
    );

    builder.addMatcher(
      isRejected(
        SaveAnnotations,
        RetrieveAnnotations,
        DeleteAnnotations,
        UpdateAnnotations,
        UpdateFiles,
        SaveAnnotationTemplates
      ),
      (state, { error }) => {
        if (error && error.message) {
          state.saveState.mode = 'error';
          state.saveState.time = new Date().getTime();
          ToastUtils.onFailure(
            `Failed to update Annotations! ${error?.message}`
          );
        }
      }
    );
  },
});

export const {
  setFiles,
  addFiles,
  setUploadedFiles,
  addFileInfo,
  setDataSetIds,
  setExtractExif,
  setAllFilesStatus,
  setFileSelectState,
  setSelectedFiles,
} = filesSlice.actions;

export default filesSlice.reducer;

export const selectAllSelectedIds = (state: State): number[] =>
  state.files.selectedIds;

export const selectAllFiles = createSelector(
  (state: State) => state.files.allIds,
  (state) => state.files.byId,
  (allIds, allFiles) => {
    return allIds.map((id) => createFileInfo(allFiles[id]));
  }
);

export const selectAllFilesSelected = createSelector(
  (state: State) => state.files.allIds,
  selectAllSelectedIds,
  (allIds, selectedFileIds) => {
    return (
      !!allIds.length && allIds.every((id) => selectedFileIds.includes(id))
    );
  }
);

export const selectAllSelectedFiles = createSelector(
  selectAllSelectedIds,
  (state) => state.files.byId,
  (selectedIds, allFiles) => {
    return selectedIds.map((fileId) => allFiles[fileId]);
  }
);

export const selectFileById = createSelector(
  (_: State, fileId: number) => fileId,
  (state) => state.files.byId,
  (fileId, files) => {
    const file = files[fileId];
    return file ? createFileInfo(file) : null;
  }
);
export const selectFileCount = (state: State): number =>
  state.files.allIds.length;

// state utility functions

const deleteFileById = (state: State, id: number) => {
  delete state.files.byId[id];
  state.files.allIds = Object.keys(state.files.byId).map((key) => +key);
};

const updateFileState = (state: State, file: FileState) => {
  const hasInState = !!state.files.byId[file.id];
  state.files.byId[file.id] = file;
  if (!hasInState) {
    state.files.allIds.push(file.id);
  }
};

const clearFileState = (state: State) => {
  state.files.byId = {};
  state.files.allIds = [];
  state.files.selectedIds = [];
};
