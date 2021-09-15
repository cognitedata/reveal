import {
  createSelector,
  createSlice,
  isAnyOf,
  PayloadAction,
} from '@reduxjs/toolkit';
import {
  AnnotationJob,
  ParamsObjectDetection,
  ParamsOCR,
  ParamsTagDetection,
  VisionAPIType,
} from 'src/api/types';
import { getFakeQueuedJob } from 'src/api/utils';
import { clearFileState, fileProcessUpdate } from 'src/store/commonActions';
import { deleteFilesById } from 'src/store/thunks/deleteFilesById';
import isEqual from 'lodash-es/isEqual';
import { DEFAULT_PAGE_SIZE } from 'src/constants/PaginationConsts';
import { postAnnotationJob } from 'src/store/thunks/PostAnnotationJob';
import { RootState } from 'src/store/rootReducer';
import { FileInfo } from '@cognite/cdf-sdk-singleton';
import { createFileInfo } from 'src/store/util/StateUtils';
import { AnnotationsBadgeStatuses, ViewMode } from '../Common/types';
import { SortPaginate } from '../Common/Components/FileTable/types';

export enum FileSortPaginateType {
  list = 'LIST',
  grid = 'GRID',
  mapLocation = 'LOCATION',
  mapNoLocation = 'NO_LOCATION',
}

export type JobState = AnnotationJob & {
  fileIds: number[];
};
export type State = {
  fileIds: number[];
  focusedFileId: number | null;
  showFileMetadataDrawer: boolean;
  showFileUploadModal: boolean;
  selectedDetectionModels: Array<VisionAPIType>;
  error?: string;
  files: {
    byId: Record<number, { jobIds: number[] }>;
    allIds: number[];
  };
  uploadedFileIds: number[];
  jobs: {
    byId: Record<number, JobState>;
    allIds: number[];
  };
  detectionModelParameters: {
    ocr: ParamsOCR;
    tagDetection: ParamsTagDetection;
    objectDetection: ParamsObjectDetection;
  };
  temporaryDetectionModelParameters: {
    ocr: ParamsOCR;
    tagDetection: ParamsTagDetection;
    objectDetection: ParamsObjectDetection;
  };
  showExploreModal: boolean;
  sortPaginate: Record<FileSortPaginateType, SortPaginate>;
  currentView: ViewMode;
  mapTableTabKey: string;
};

const initialDetectionModelParameters = {
  ocr: {
    useCache: true,
  },
  tagDetection: {
    useCache: true,
    partialMatch: true,
    assetSubtreeIds: [],
  },
  objectDetection: {
    threshold: 0.8,
  },
};

const initialState: State = {
  fileIds: [],
  focusedFileId: null,
  showFileMetadataDrawer: false,
  showFileUploadModal: false,
  selectedDetectionModels: [VisionAPIType.OCR],
  files: {
    byId: {},
    allIds: [],
  },
  uploadedFileIds: [],
  jobs: {
    byId: {},
    allIds: [],
  },
  // eslint-disable-next-line global-require
  // jobsByFileId: require('./fakeJobs.json'),
  error: undefined,
  detectionModelParameters: initialDetectionModelParameters,
  temporaryDetectionModelParameters: initialDetectionModelParameters,
  showExploreModal: false,
  sortPaginate: {
    LIST: { currentPage: 1, pageSize: DEFAULT_PAGE_SIZE },
    GRID: { currentPage: 1, pageSize: DEFAULT_PAGE_SIZE },
    LOCATION: { currentPage: 1, pageSize: DEFAULT_PAGE_SIZE },
    NO_LOCATION: { currentPage: 1, pageSize: DEFAULT_PAGE_SIZE },
  },
  currentView: 'list',
  mapTableTabKey: 'fileInMap',
};

const processSlice = createSlice({
  name: 'processSlice',
  initialState,
  /* eslint-disable no-param-reassign */
  reducers: {
    setProcessFileIds(state, action: PayloadAction<number[]>) {
      state.fileIds = action.payload;
    },
    hideFileMetadataPreview(state) {
      if (state.showFileMetadataDrawer) {
        state.showFileMetadataDrawer = false;
      }
    },
    showFileMetadataPreview(state) {
      if (!state.showFileMetadataDrawer) {
        state.showFileMetadataDrawer = true;
      }
    },
    setFocusedFileId(state, action: PayloadAction<number | null>) {
      state.focusedFileId = action.payload;
    },
    setSelectedDetectionModels(
      state,
      action: PayloadAction<Array<VisionAPIType>>
    ) {
      state.selectedDetectionModels = action.payload;
    },
    setParamsOCR(state, action: PayloadAction<ParamsOCR>) {
      state.temporaryDetectionModelParameters.ocr = action.payload;
    },
    setParamsTagDetection(state, action: PayloadAction<ParamsTagDetection>) {
      state.temporaryDetectionModelParameters.tagDetection = action.payload;
    },
    setParamsObjectDetection(
      state,
      action: PayloadAction<ParamsObjectDetection>
    ) {
      state.temporaryDetectionModelParameters.objectDetection = action.payload;
    },
    setDetectionModelParameters(state) {
      state.detectionModelParameters = state.temporaryDetectionModelParameters;
    },

    revertDetectionModelParameters(state) {
      state.temporaryDetectionModelParameters = state.detectionModelParameters;
    },
    resetDetectionModelParameters(state) {
      state.temporaryDetectionModelParameters = initialDetectionModelParameters;
    },
    removeJobById(state, action: PayloadAction<number>) {
      const existingJob = state.jobs.byId[action.payload];
      if (existingJob) {
        const { fileIds } = existingJob;
        fileIds.forEach((id) => {
          const file = state.files.byId[id];
          if (file && file.jobIds.includes(action.payload)) {
            state.files.byId[id].jobIds = file.jobIds.filter(
              (jid) => jid !== action.payload
            );
          }
        });
      }
      delete state.jobs.byId[action.payload];
      state.files.allIds = Object.keys(state.files.byId).map((id) =>
        parseInt(id, 10)
      );
    },
    setProcessViewFileUploadModalVisibility(
      state,
      action: PayloadAction<boolean>
    ) {
      state.showFileUploadModal = action.payload;
    },
    setSelectFromExploreModalVisibility(state, action: PayloadAction<boolean>) {
      state.showExploreModal = action.payload;
    },
    setSortKey(
      state,
      action: PayloadAction<{ type: FileSortPaginateType; sortKey: string }>
    ) {
      const { type, sortKey } = action.payload;
      state.sortPaginate[type] = { ...state.sortPaginate[type], sortKey };
    },
    setReverse(
      state,
      action: PayloadAction<{ type: FileSortPaginateType; reverse: boolean }>
    ) {
      const { type, reverse } = action.payload;
      state.sortPaginate[type] = { ...state.sortPaginate[type], reverse };
    },
    setCurrentPage(
      state,
      action: PayloadAction<{
        type: FileSortPaginateType;
        currentPage: number;
      }>
    ) {
      const { type, currentPage } = action.payload;
      state.sortPaginate[type] = { ...state.sortPaginate[type], currentPage };
    },
    setPageSize(
      state,
      action: PayloadAction<{
        type: FileSortPaginateType;
        pageSize: number;
      }>
    ) {
      const { type, pageSize } = action.payload;
      state.sortPaginate[type] = { ...state.sortPaginate[type], pageSize };
    },
    setProcessCurrentView(state, action: PayloadAction<ViewMode>) {
      state.currentView = action.payload;
    },
    setMapTableTabKey(
      state,
      action: PayloadAction<{
        mapTableTabKey: string;
      }>
    ) {
      state.mapTableTabKey = action.payload.mapTableTabKey;
    },
    addProcessUploadedFileId(state, action: PayloadAction<number>) {
      state.uploadedFileIds.push(action.payload);
    },
    clearUploadedFiles(state) {
      state.uploadedFileIds = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fileProcessUpdate, (state, { payload }) => {
      const { fileIds, job, modelType } = payload;
      addJobToState(state, fileIds, job, modelType);
    });

    /* postAnnotationJobs */

    builder.addCase(postAnnotationJob.pending, (state, { meta }) => {
      const { fileIds, modelType } = meta.arg;

      addJobToState(
        state,
        fileIds,
        { ...getFakeQueuedJob(modelType), type: modelType },
        modelType
      );
    });

    builder.addCase(postAnnotationJob.fulfilled, (state, { payload, meta }) => {
      const newJob = payload;
      const { fileIds, modelType } = meta.arg;
      addJobToState(state, fileIds, newJob, modelType);
    });

    builder.addCase(postAnnotationJob.rejected, (state, { error, meta }) => {
      const { fileIds, modelType } = meta.arg;
      const queuedJob = state.jobs.byId[getFakeQueuedJob(modelType).jobId];

      if (queuedJob) {
        // remove or update queued job
        fileIds.forEach((id) => {
          const file = state.files.byId[id];
          if (file && file.jobIds.includes(queuedJob.jobId)) {
            state.files.byId[id].jobIds = file.jobIds.filter(
              (jid) => jid !== queuedJob.jobId
            );
          }
        });

        const filteredFileIds = queuedJob.fileIds.filter(
          (fid) => !fileIds.includes(fid)
        );
        state.jobs.byId[queuedJob.jobId].fileIds = filteredFileIds;

        if (!filteredFileIds.length) {
          delete state.jobs.byId[queuedJob.jobId];
        }
      }

      state.error = error.message;
    });

    builder.addMatcher(
      isAnyOf(deleteFilesById.fulfilled, clearFileState),
      (state, action) => {
        action.payload.forEach((fileId) => {
          // clear jobs state
          if (state.files.byId[fileId]) {
            const { jobIds } = state.files.byId[fileId];
            jobIds.forEach((jobId) => {
              delete state.jobs.byId[jobId];
              state.jobs.allIds = Object.keys(state.jobs.byId).map((id) =>
                parseInt(id, 10)
              );
            });
          }

          // clear upload state

          state.uploadedFileIds = state.uploadedFileIds.filter(
            (id) => id !== fileId
          );

          delete state.files.byId[fileId];
          if (state.focusedFileId === fileId) {
            // hide drawer and reset selected file if it's deleted
            state.focusedFileId = null;
            state.showFileMetadataDrawer = false;
          }
        });
        state.files.allIds = Object.keys(state.files.byId).map((id) =>
          parseInt(id, 10)
        );
      }
    );
  },
  /* eslint-enable no-param-reassign */
});

export const {
  setProcessFileIds,
  removeJobById,
  setSelectedDetectionModels,
  hideFileMetadataPreview,
  showFileMetadataPreview,
  setFocusedFileId,
  setParamsOCR,
  setParamsTagDetection,
  setParamsObjectDetection,
  setDetectionModelParameters,
  revertDetectionModelParameters,
  resetDetectionModelParameters,
  setProcessViewFileUploadModalVisibility,
  setSelectFromExploreModalVisibility,
  setSortKey,
  setReverse,
  setCurrentPage,
  setPageSize,
  setProcessCurrentView,
  setMapTableTabKey,
  addProcessUploadedFileId,
  clearUploadedFiles,
} = processSlice.actions;

export default processSlice.reducer;

const addJobToState = (
  state: State,
  fileIds: number[],
  job: AnnotationJob,
  modelType: VisionAPIType
) => {
  /* eslint-disable  no-param-reassign */
  const jobState: JobState = { ...job, fileIds, type: modelType };
  const existingJob = state.jobs.byId[job.jobId];
  if (!existingJob || !isEqual(jobState, existingJob)) {
    if (existingJob) {
      // for fake queued state
      const fileIdSet = new Set(existingJob.fileIds);
      jobState.fileIds.forEach((item) => fileIdSet.add(item));
      jobState.fileIds = Array.from(fileIdSet);
    }
    state.jobs.byId[job.jobId] = jobState;
    state.jobs.allIds = Object.keys(state.jobs.byId).map((id) =>
      parseInt(id, 10)
    );
  }
  if (!existingJob) {
    jobState.fileIds.forEach((fileId) => {
      if (!state.files.byId[fileId]) {
        state.files.byId[fileId] = { jobIds: [] };
      }
      const fileState = state.files.byId[fileId];
      // if jobid with same model type exists replace the job id with new job
      const fileJobIds = fileState.jobIds;

      const existingJobTypes = fileJobIds.map((id) => state.jobs.byId[id].type);
      if (!fileJobIds.includes(jobState.jobId)) {
        const indexOfExistingJobWithSameModelType = existingJobTypes.findIndex(
          (type) => type === jobState.type
        );
        if (indexOfExistingJobWithSameModelType >= 0) {
          fileJobIds.splice(indexOfExistingJobWithSameModelType, 1);
        }
        fileJobIds.push(jobState.jobId);
      }
    });
    state.files.allIds = Object.keys(state.files.byId).map((id) =>
      parseInt(id, 10)
    );
  }
  /* eslint-enable  no-param-reassign */
};

// selectors

export const selectAllFilesDict = (
  state: State
): { [id: number]: { jobIds: number[] } } => state.files.byId;

export const selectAllJobs = (state: State): { [id: number]: JobState } =>
  state.jobs.byId;

export const selectJobIdsByFileId = (state: State, fileId: number): number[] =>
  state.files.byId[fileId]?.jobIds || [];

export const selectJobsByFileId = createSelector(
  selectJobIdsByFileId,
  selectAllJobs,
  (fileJobIds, allJobs) => {
    return fileJobIds.map((jid) => allJobs[jid]);
  }
);

export const selectAllProcessFiles = createSelector(
  (state: RootState) => state.filesSlice.files.byId,
  (state: RootState) => state.processSlice.fileIds,
  (allFiles, allIds) => {
    const files: FileInfo[] = [];
    allIds.forEach(
      (id) => !!allFiles[id] && files.push(createFileInfo(allFiles[id]))
    );
    return files;
  }
);

export const selectIsPollingComplete = createSelector(
  selectAllFilesDict,
  selectAllJobs,
  (allFiles, allJobs) => {
    return Object.keys(allFiles).every((fileId) => {
      const fileJobs = allFiles[parseInt(fileId, 10)].jobIds;
      if (!fileJobs || !fileJobs.length) {
        return true;
      }
      return fileJobs.every((jobId) => {
        const job = allJobs[jobId];
        return job.status === 'Completed' || job.status === 'Failed';
      });
    });
  }
);

export const selectIsProcessingStarted = createSelector(
  (state: State) => state.files.byId,
  (allFiles) => {
    if (Object.keys(allFiles).length) {
      return Object.keys(allFiles).every((fileId) => {
        const fileJobs = allFiles[parseInt(fileId, 10)].jobIds;
        return fileJobs && fileJobs.length;
      });
    }
    return false;
  }
);

export const makeSelectAnnotationStatuses = () =>
  createSelector(selectJobsByFileId, (fileJobs) => {
    const annotationBadgeProps = {
      tag: {},
      gdpr: {},
      text: {},
      objects: {},
    };
    fileJobs.forEach((job) => {
      const statusData = { status: job.status, statusTime: job.statusTime };
      if (job.type === VisionAPIType.OCR) {
        annotationBadgeProps.text = statusData;
      }
      if (job.type === VisionAPIType.TagDetection) {
        annotationBadgeProps.tag = statusData;
      }
      if (job.type === VisionAPIType.ObjectDetection) {
        annotationBadgeProps.objects = statusData;
        annotationBadgeProps.gdpr = statusData;
      }
    });
    return annotationBadgeProps as AnnotationsBadgeStatuses;
  });

// helpers
export const isProcessingFile = (
  annotationStatuses: AnnotationsBadgeStatuses
) => {
  const statuses = Object.keys(annotationStatuses) as Array<
    keyof AnnotationsBadgeStatuses
  >;
  return statuses.some((key) =>
    ['Queued', 'Running'].includes(annotationStatuses[key]?.status || '')
  );
};
