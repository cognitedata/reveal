import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { fetchJobById, createAnnotationJob } from 'src/api/annotationJob';
import { fetchUntilComplete } from 'src/utils';
import { AnnotationJob, VisionAPIType } from 'src/api/types';
import { getFakeQueuedJob } from 'src/api/utils';
import { fileProcessUpdate } from 'src/store/commonActions';
import { deleteFilesById } from 'src/store/thunks/deleteFilesById';
import { SaveAvailableAnnotations } from 'src/store/thunks/SaveAvailableAnnotations';
import { ThunkConfig } from 'src/store/rootReducer';
import isEqual from 'lodash-es/isEqual';
import { AnnotationsBadgeStatuses } from '../Common/types';

export type JobState = AnnotationJob & {
  fileIds: number[];
};
type State = {
  selectedFileId: number | null;
  showFileMetadataDrawer: boolean;
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
};

const initialState: State = {
  selectedFileId: null,
  showFileMetadataDrawer: false,
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
    const createdJob = await createAnnotationJob(modelType, fileIds);

    const doesFileExist = (fileId: number) =>
      getState().uploadedFiles.files.byId[fileId];

    await fetchUntilComplete<AnnotationJob>(
      () => fetchJobById(createdJob.type, createdJob.jobId),
      {
        isCompleted: (latestJobVersion) =>
          latestJobVersion.status === 'Completed' ||
          latestJobVersion.status === 'Failed' ||
          !fileIds.some(doesFileExist), // we don't want to poll jobs for removed files

        onTick: (latestJobVersion) => {
          dispatch(
            fileProcessUpdate({ modelType, fileIds, job: latestJobVersion })
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
    toggleFileMetadataPreview(state) {
      state.showFileMetadataDrawer = !state.showFileMetadataDrawer;
    },
    showFileMetadataPreview(state) {
      state.showFileMetadataDrawer = true;
    },
    setSelectedFileId(state, action: PayloadAction<number>) {
      state.selectedFileId = action.payload;
    },
    setSelectedDetectionModels(
      state,
      action: PayloadAction<Array<VisionAPIType>>
    ) {
      state.selectedDetectionModels = action.payload;
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
  },
  extraReducers: (builder) => {
    builder.addCase(fileProcessUpdate, (state, { payload }) => {
      const { fileIds, job, modelType } = payload;
      addJobToState(state, fileIds, job, modelType);
    });

    builder.addCase(deleteFilesById.fulfilled, (state, { payload }) => {
      payload.forEach((intId) => {
        delete state.files.byId[intId.id];
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

    builder.addCase(SaveAvailableAnnotations.fulfilled, (state) => {
      state.selectedFileId = null;
      state.jobs = initialState.jobs;
      state.files = initialState.files;
      state.error = initialState.error;
      state.showFileMetadataDrawer = initialState.showFileMetadataDrawer;
      state.selectedDetectionModels = initialState.selectedDetectionModels;
    });
  },
  /* eslint-enable no-param-reassign */
});

export const {
  removeJobById,
  setSelectedDetectionModels,
  toggleFileMetadataPreview,
  showFileMetadataPreview,
  setSelectedFileId,
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

export const makeGetAnnotationStatuses = () =>
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
