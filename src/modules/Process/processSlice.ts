import { createSelector, isAnyOf, PayloadAction } from '@reduxjs/toolkit';
import {
  AnnotationJob,
  AnnotationJobCompleted,
  AnnotationJobRunning,
  DetectionModelParams,
  VisionAPIType,
} from 'src/api/types';
import {
  AnnotationsBadgeStatuses,
  AnnotationStatuses,
} from 'src/modules/Common/types';
import { clearFileState, fileProcessUpdate } from 'src/store/commonActions';
import isEqual from 'lodash-es/isEqual';
import { DEFAULT_PAGE_SIZE } from 'src/constants/PaginationConsts';
import { RootState } from 'src/store/rootReducer';
import { FileInfo } from '@cognite/sdk';
import { DeleteFilesById } from 'src/store/thunks/Files/DeleteFilesById';
import { postAnnotationJob } from 'src/store/thunks/Process/PostAnnotationJob';
import { createFileInfo } from 'src/store/util/StateUtils';
import { GenericSort, SortKeys } from 'src/modules/Common/Utils/SortUtils';
import {
  createGenericTabularDataSlice,
  GenericTabularState,
} from 'src/store/genericTabularDataSlice';
import { useSelector } from 'react-redux';
import { selectAllSelectedIds } from 'src/modules/Common/store/files/selectors';
import { getFakeQueuedJob } from 'src/api/detectionUtils';
import { createSelectorCreator, defaultMemoize } from 'reselect';

export type JobState = AnnotationJob & {
  fileIds: number[];
  completedFileIds?: number[];
  failedFileIds?: number[];
  failedFiles?: { fileId: number; error: string }[];
};
export type State = GenericTabularState & {
  fileIds: number[];
  showFileUploadModal: boolean;
  files: {
    byId: Record<number, { jobIds: number[] }>;
    allIds: number[];
  };
  uploadedFileIds: number[];
  jobs: {
    byId: Record<number, JobState>;
    allIds: number[];
  };
  error?: string;
  selectedDetectionModels: Array<VisionAPIType>;
  availableDetectionModels: {
    modelName: string;
    type: VisionAPIType;
    settings: DetectionModelParams;
    unsavedSettings: DetectionModelParams;
  }[];
  showExploreModal: boolean;
  showSummaryModal: boolean;
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
  customModel: {
    modelFile: undefined,
    threshold: 0.8,
  },
};

export const initialState: State = {
  focusedFileId: null,
  showFileMetadata: false,
  currentView: 'list',
  mapTableTabKey: 'fileInMap',
  sortMeta: {
    sortKey: '',
    reverse: false,
    currentPage: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  },
  isLoading: false,
  fileIds: [],
  showFileUploadModal: false,
  files: {
    byId: {},
    allIds: [],
  },
  uploadedFileIds: [],
  jobs: {
    byId: {},
    allIds: [],
  },
  error: undefined,
  selectedDetectionModels: [VisionAPIType.OCR],
  availableDetectionModels: [
    {
      modelName: 'Text detection',
      type: VisionAPIType.OCR,
      settings: initialDetectionModelParameters.ocr,
      unsavedSettings: initialDetectionModelParameters.ocr,
    },
    {
      modelName: 'Asset tag detection',
      type: VisionAPIType.TagDetection,
      settings: initialDetectionModelParameters.tagDetection,
      unsavedSettings: initialDetectionModelParameters.tagDetection,
    },
    {
      modelName: 'Object detection',
      type: VisionAPIType.ObjectDetection,
      settings: initialDetectionModelParameters.objectDetection,
      unsavedSettings: initialDetectionModelParameters.objectDetection,
    },
  ],
  showExploreModal: false,
  showSummaryModal: false,
};

/* eslint-disable no-param-reassign */
const processSlice = createGenericTabularDataSlice({
  name: 'processSlice',
  initialState: initialState as State,
  reducers: {
    setProcessFileIds(state, action: PayloadAction<number[]>) {
      state.fileIds = action.payload;
    },
    setSelectedDetectionModels(
      state,
      action: PayloadAction<Array<VisionAPIType>>
    ) {
      state.selectedDetectionModels = action.payload;
    },
    setUnsavedDetectionModelSettings(
      state,
      action: PayloadAction<{
        modelIndex: number;
        params: DetectionModelParams;
      }>
    ) {
      const { params, modelIndex } = action.payload;
      state.availableDetectionModels[modelIndex].unsavedSettings = params;
    },
    setDetectionModelParameters(state) {
      state.availableDetectionModels.forEach((item) => {
        item.settings = item.unsavedSettings;
      });
    },

    revertDetectionModelParameters(state) {
      state.availableDetectionModels.forEach((item) => {
        item.unsavedSettings = item.settings;
      });
    },
    resetDetectionModelParameters(state) {
      state.availableDetectionModels.forEach((item) => {
        switch (item.type) {
          case VisionAPIType.OCR:
            item.unsavedSettings = initialDetectionModelParameters.ocr;
            break;
          case VisionAPIType.TagDetection:
            item.unsavedSettings = initialDetectionModelParameters.tagDetection;
            break;
          case VisionAPIType.ObjectDetection:
            item.unsavedSettings =
              initialDetectionModelParameters.objectDetection;
            break;
          case VisionAPIType.CustomModel:
            item.unsavedSettings = initialDetectionModelParameters.customModel;
            break;
        }
      });
    },
    addToAvailableDetectionModels(state) {
      const modelCount = state.availableDetectionModels.length;
      const builtinModelCount = 3; // ocr, tag & objectdetection
      const modelName =
        modelCount - builtinModelCount
          ? `Custom model (${modelCount - builtinModelCount})`
          : 'Custom model';
      state.availableDetectionModels.push({
        modelName,
        type: VisionAPIType.CustomModel,
        settings: initialDetectionModelParameters.customModel,
        unsavedSettings: initialDetectionModelParameters.customModel,
      });
    },
    setCustomModelName(
      state,
      action: PayloadAction<{
        modelIndex: number;
        modelName: string;
      }>
    ) {
      const { modelIndex, modelName } = action.payload;
      state.availableDetectionModels[modelIndex].modelName = modelName;
    },
    removeJobById(state, action: PayloadAction<number>) {
      removeJobFromFiles(state, action.payload);

      delete state.jobs.byId[action.payload];
      state.jobs.allIds = Object.keys(state.jobs.byId).map((id) =>
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
    setSummaryModalVisibility(state, action: PayloadAction<boolean>) {
      state.showSummaryModal = action.payload;
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
      const { fileIds, job, modelType, completedFileIds, failedFileIds } =
        payload;
      addJobToState(
        state,
        fileIds,
        job,
        modelType,
        completedFileIds,
        failedFileIds
      );
    });

    /* postAnnotationJob */

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
        removeJobFromFiles(state, queuedJob.jobId);

        const filteredFileIds = queuedJob.fileIds.filter(
          (fid) => !fileIds.includes(fid)
        );
        state.jobs.byId[queuedJob.jobId].fileIds = filteredFileIds;

        if (!filteredFileIds.length) {
          delete state.jobs.byId[queuedJob.jobId];
          state.jobs.allIds = Object.keys(state.jobs.byId).map((id) =>
            parseInt(id, 10)
          );
        }
      }

      state.error = error.message;
    });

    builder.addMatcher(
      isAnyOf(DeleteFilesById.fulfilled, clearFileState),
      (state, action) => {
        const deletedFileIds = action.payload;
        deletedFileIds.forEach((fileId) => {
          // clear jobs state
          if (state.files.byId[fileId]) {
            const { jobIds } = state.files.byId[fileId];
            jobIds.forEach((jobId) => {
              const job = state.jobs.byId[jobId];
              const otherFilesInJob = job.fileIds.filter(
                (otherFileId) => otherFileId !== fileId
              );
              if (
                otherFilesInJob.every(
                  (otherFileId) => !state.files.byId[otherFileId]
                )
              ) {
                // if every other file of the job is deleted
                delete state.jobs.byId[jobId];
                state.jobs.allIds = Object.keys(state.jobs.byId).map((id) =>
                  parseInt(id, 10)
                );
              }
            });
          }

          delete state.files.byId[fileId];
          if (state.focusedFileId === fileId) {
            // hide drawer and reset selected file if it's deleted
            state.focusedFileId = null;
            state.showFileMetadata = false;
          }
        });
        // clear upload state

        state.uploadedFileIds = state.uploadedFileIds.filter(
          (id) => !deletedFileIds.includes(id)
        );

        // clear loaded Ids

        state.fileIds = state.fileIds.filter(
          (id) => !deletedFileIds.includes(id)
        );

        state.files.allIds = Object.keys(state.files.byId).map((id) =>
          parseInt(id, 10)
        );
      }
    );
  },
  /* eslint-enable no-param-reassign */
});

export type { State as ProcessReducerState };
export { initialState as processReducerInitialState };

export const {
  setProcessFileIds,
  removeJobById,
  setSelectedDetectionModels,
  hideFileMetadata,
  showFileMetadata,
  setFocusedFileId,
  setUnsavedDetectionModelSettings,
  setDetectionModelParameters,
  revertDetectionModelParameters,
  resetDetectionModelParameters,
  setCustomModelName,
  addToAvailableDetectionModels,
  setProcessViewFileUploadModalVisibility,
  setSelectFromExploreModalVisibility,
  setSummaryModalVisibility,
  setSortKey,
  setReverse,
  setCurrentPage,
  setPageSize,
  setCurrentView,
  setMapTableTabKey,
  addProcessUploadedFileId,
  clearUploadedFiles,
  setIsLoading,
} = processSlice.actions;

export default processSlice.reducer;

/* eslint-disable  no-param-reassign */
const removeJobFromFiles = (state: State, jobId: number) => {
  const existingJob = state.jobs.byId[jobId];

  if (existingJob && existingJob.fileIds && existingJob.fileIds.length) {
    const { fileIds } = existingJob;

    fileIds.forEach((id) => {
      const file = state.files.byId[id];
      if (file && file.jobIds.includes(jobId)) {
        state.files.byId[id].jobIds = file.jobIds.filter(
          (jid) => jid !== jobId
        );
      }
    });
  }
};

const addJobToState = (
  state: State,
  fileIds: number[],
  job: AnnotationJob,
  modelType: VisionAPIType,
  completedFileIds?: number[],
  failedFileIds?: number[]
) => {
  const jobState: JobState = {
    ...job,
    fileIds,
    type: modelType,
    completedFileIds,
    failedFileIds,
  };

  if (job.status === 'Completed' || job.status === 'Running') {
    jobState.failedFiles = (
      job as AnnotationJobRunning | AnnotationJobCompleted
    ).failedItems?.reduce(
      (acc: { fileId: number; error: string }[], next) =>
        acc.concat(
          next.items.map((item) => ({
            fileId: item.fileId,
            error: next.errorMessage,
          }))
        ),
      []
    );
  }
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
};
/* eslint-enable  no-param-reassign */
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

export const selectAllJobsForAllFilesDict = createSelector(
  selectAllFilesDict,
  selectAllJobs,
  (allFilesDict, allJobs) => {
    const allJobsAllFilesDict = Object.entries(allFilesDict).map(
      ([fileId, { jobIds }]) => {
        return { fileId, jobs: jobIds.map((jobId) => allJobs[jobId]) };
      }
    );
    return allJobsAllFilesDict;
  }
);

export const selectAllProcessFiles = createSelector(
  (state: RootState) => state.fileReducer.files.byId,
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

export const selectUnfinishedJobs = createSelector(
  (state: State) => state.jobs.allIds,
  selectAllJobs,
  (allJobIds, allJobs) => {
    return allJobIds
      .map((id) => allJobs[id])
      .filter(
        (job) =>
          job.jobId > 0 && (job.status === 'Queued' || job.status === 'Running')
      );
  }
);

const createDeepEqualSelector = createSelectorCreator(defaultMemoize, isEqual);

export const makeSelectJobStatusForFile = () =>
  createDeepEqualSelector(
    (state: State, fileId: number) => fileId,
    selectJobsByFileId,
    (fileId, fileJobs) => {
      const annotationBadgeProps = {
        tag: {},
        gdpr: {},
        text: {},
        objects: {},
      };
      fileJobs.forEach((job) => {
        let status = 'Running';
        if (job.status === 'Queued') {
          status = 'Queued';
        } else if (job.completedFileIds?.includes(fileId)) {
          status = 'Completed';
        } else if (job.failedFileIds?.includes(fileId)) {
          status = 'Failed';
        }

        const statusData = {
          status,
          statusTime: job.statusTime,
          error: job.failedFiles?.find((file) => file.fileId === fileId)?.error,
        };
        if (job.type === VisionAPIType.OCR) {
          annotationBadgeProps.text = statusData;
        }
        if (job.type === VisionAPIType.TagDetection) {
          annotationBadgeProps.tag = statusData;
        }
        if (
          [VisionAPIType.ObjectDetection, VisionAPIType.CustomModel].includes(
            job.type
          )
        ) {
          annotationBadgeProps.objects = statusData;
          annotationBadgeProps.gdpr = statusData;
        }
      });
      return annotationBadgeProps as AnnotationsBadgeStatuses;
    }
  );

export const selectPageCount = createSelector(
  (state: State) => state.fileIds,
  (state: State) => state.sortMeta,
  (fileIds, sortMeta) => {
    return Math.ceil(fileIds.length / sortMeta.pageSize);
  }
);

export const selectProcessSortedFiles = createSelector(
  selectAllProcessFiles,
  (rootState: RootState) => rootState.processSlice.sortMeta.sortKey,
  (rootState: RootState) => rootState.processSlice.sortMeta.reverse,
  GenericSort
);

export const selectProcessSelectedFileIdsInSortedOrder = createSelector(
  selectProcessSortedFiles,
  (rootState: RootState) => selectAllSelectedIds(rootState.fileReducer),
  (sortedFiles, selectedIds) => {
    const indexMap = new Map<number, number>(
      sortedFiles.map((item, index) => [item.id, index])
    );

    const sortedIds = GenericSort(
      selectedIds,
      SortKeys.indexInSortedArray,
      false,
      indexMap
    );

    return sortedIds;
  }
);

export const selectProcessAllSelectedFilesInSortedOrder = createSelector(
  selectProcessSelectedFileIdsInSortedOrder,
  (rootState: RootState) => rootState.fileReducer.files.byId,
  (sortedSelectedFileIds, allFiles) => {
    return sortedSelectedFileIds.map((id) => allFiles[id]);
  }
);

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

export const hasJobsFailedForFile = (
  annotationStatuses: AnnotationsBadgeStatuses
) => {
  const statuses = Object.values(
    annotationStatuses
  ) as Array<AnnotationStatuses>;
  return statuses.some((value) => value.status === 'Failed' || !!value.error);
};

// hooks

export const useIsSelectedInProcess = (id: number) => {
  const selectedIds = useSelector(({ fileReducer }: RootState) =>
    selectAllSelectedIds(fileReducer)
  );
  return selectedIds.includes(id);
};

export const useProcessFilesSelected = () => {
  const selectedIds = useSelector(({ fileReducer }: RootState) =>
    selectAllSelectedIds(fileReducer)
  );
  return !!selectedIds.length;
};
