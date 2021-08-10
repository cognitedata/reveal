import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { fetchJobById, createAnnotationJob } from 'src/api/annotationJob';
import { fetchUntilComplete } from 'src/utils';
import {
  AnnotationJob,
  DetectionModelParams,
  ParamsObjectDetection,
  ParamsOCR,
  ParamsTagDetection,
  VisionAPIType,
} from 'src/api/types';
import { getFakeQueuedJob } from 'src/api/utils';
import { fileProcessUpdate } from 'src/store/commonActions';
import { deleteFilesById } from 'src/store/thunks/deleteFilesById';
import { ThunkConfig } from 'src/store/rootReducer';
import isEqual from 'lodash-es/isEqual';
import { AnnotationDetectionJobUpdate } from 'src/store/thunks/AnnotationDetectionJobUpdate';
import { RetrieveAnnotations } from 'src/store/thunks/RetrieveAnnotations';
import { DEFAULT_PAGE_SIZE } from 'src/constants/PaginationConsts';
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
type State = {
  selectedFileId: number | null;
  showFileMetadataDrawer: boolean;
  showFileUploadModal: boolean;
  selectedDetectionModels: Array<VisionAPIType>;
  error?: string;
  files: {
    byId: Record<number, { jobIds: number[] }>;
    allIds: number[];
  };
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

const initalDetectionModelParameters = {
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
  selectedFileId: null,
  showFileMetadataDrawer: false,
  showFileUploadModal: false,
  selectedDetectionModels: [VisionAPIType.OCR],
  files: {
    byId: {},
    allIds: [],
  },
  jobs: {
    byId: {},
    allIds: [],
  },
  // eslint-disable-next-line global-require
  // jobsByFileId: require('./fakeJobs.json'),
  error: undefined,
  detectionModelParameters: initalDetectionModelParameters,
  temporaryDetectionModelParameters: initalDetectionModelParameters,
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

// for requested files, create annotation jobs with requested detectionModels and setup polling on these jobs
export const detectAnnotations = createAsyncThunk<
  void,
  { fileIds: Array<number>; detectionModels: Array<VisionAPIType> },
  ThunkConfig
>(
  'process/detectAnnotations',
  async ({ fileIds, detectionModels }, { dispatch, getState }) => {
    if (!detectionModels.length) {
      throw new Error(
        'To detect annotations at least one detection model must be selected'
      );
    }

    const batchSize = 10;
    const { files, jobs } = getState().processSlice;
    const batchFileIdsList: number[][] = fileIds.reduce((acc, _, i) => {
      if (i % batchSize === 0) {
        acc.push(fileIds.slice(i, i + batchSize));
      }
      return acc;
    }, [] as number[][]);

    batchFileIdsList.forEach((batchFileIds) => {
      detectionModels.forEach((modelType) => {
        const filteredBatchFileIds = batchFileIds.filter((fileId: number) => {
          const fileJobIds = files.byId[fileId]?.jobIds;
          return (
            !fileJobIds ||
            !fileJobIds
              .map((jobId) => jobs.byId[jobId])
              .some((job) => job.type === modelType)
          );
        });

        dispatch(
          postAnnotationJob({
            modelType,
            fileIds: filteredBatchFileIds,
          })
        );
      });
    });
  }
);

export const postAnnotationJob = createAsyncThunk<
  AnnotationJob,
  { modelType: VisionAPIType; fileIds: number[] },
  ThunkConfig
>(
  'process/postAnnotationJobs',
  async ({ modelType, fileIds }, { dispatch, getState }) => {
    const params = getDetectionModelParameters(
      getState().processSlice,
      modelType
    );
    const createdJob = await createAnnotationJob(modelType, fileIds, params);

    const doesFileExist = (fileId: number) =>
      getState().filesSlice.files.byId[fileId];

    await fetchUntilComplete<AnnotationJob>(
      () => fetchJobById(createdJob.type, createdJob.jobId),
      {
        isCompleted: (latestJobVersion) =>
          latestJobVersion.status === 'Completed' ||
          latestJobVersion.status === 'Failed' ||
          !fileIds.some(doesFileExist), // we don't want to poll jobs for removed files

        onTick: async (latestJobVersion) => {
          await dispatch(AnnotationDetectionJobUpdate(latestJobVersion));
          if (latestJobVersion.status === 'Completed') {
            await dispatch(RetrieveAnnotations(fileIds));
          }
          dispatch(
            fileProcessUpdate({
              modelType,
              fileIds,
              job: latestJobVersion,
            })
          );
        },

        onError: (error) => {
          dispatch(removeJobById(createdJob.jobId));
          // eslint-disable-next-line no-console
          console.error(error); // todo better error handling of polling errors
        },
      }
    );

    return createdJob;
  }
);

const processSlice = createSlice({
  name: 'processSlice',
  initialState,
  /* eslint-disable no-param-reassign */
  reducers: {
    hideFileMetadataPreview(state) {
      state.showFileMetadataDrawer = false;
    },
    showFileMetadataPreview(state) {
      state.showFileMetadataDrawer = true;
    },
    setSelectedFileId(state, action: PayloadAction<number | null>) {
      state.selectedFileId = action.payload;
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
      state.temporaryDetectionModelParameters = initalDetectionModelParameters;
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
  },
  extraReducers: (builder) => {
    builder.addCase(fileProcessUpdate, (state, { payload }) => {
      const { fileIds, job, modelType } = payload;
      addJobToState(state, fileIds, job, modelType);
    });

    builder.addCase(deleteFilesById.fulfilled, (state, { payload }) => {
      payload.forEach((intId) => {
        delete state.files.byId[intId.id];
        if (state.selectedFileId === intId.id) {
          // hide drawer and reset selected file if it's deleted
          state.selectedFileId = null;
          state.showFileMetadataDrawer = false;
        }
      });
      state.files.allIds = Object.keys(state.files.byId).map((id) =>
        parseInt(id, 10)
      );
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
  },
  /* eslint-enable no-param-reassign */
});

export const {
  removeJobById,
  setSelectedDetectionModels,
  hideFileMetadataPreview,
  showFileMetadataPreview,
  setSelectedFileId,
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

const getDetectionModelParameters = (
  state: State,
  modelType: VisionAPIType
): DetectionModelParams | undefined => {
  switch (modelType) {
    case VisionAPIType.OCR: {
      return state.detectionModelParameters.ocr;
    }
    case VisionAPIType.TagDetection: {
      return state.detectionModelParameters.tagDetection;
    }
    case VisionAPIType.ObjectDetection: {
      return state.detectionModelParameters.objectDetection;
    }
    default: {
      return undefined;
    }
  }
};
