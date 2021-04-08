import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchJobById, createAnnotationJob } from 'src/api/annotationJob';
import { fetchUntilComplete } from 'src/utils';
import { AnnotationJob, DetectionModelType } from 'src/api/types';
import { getFakeQueuedJob } from 'src/api/utils';
import { fileProcessUpdate } from 'src/store/commonActions';
import { deleteFilesById } from 'src/store/thunks/deleteFilesById';
import { ThunkConfig } from 'src/store/rootReducer';
import { SaveAvailableAnnotations } from 'src/store/thunks/SaveAvailableAnnotations';

type State = {
  selectedFileId: number | null;
  showFileMetadataDrawer: boolean;
  selectedDetectionModels: Array<DetectionModelType>;
  jobsByFileId: Record<string, Array<AnnotationJob> | undefined>;
  error?: string;
};

const initialState: State = {
  selectedFileId: null,
  showFileMetadataDrawer: false,
  selectedDetectionModels: [DetectionModelType.Text],
  jobsByFileId: {},
  // eslint-disable-next-line global-require
  // jobsByFileId: require('./fakeJobs.json'),
  error: undefined,
};

// for requested files, create annotation jobs with requested detectionModels and setup polling on these jobs
export const detectAnnotations = createAsyncThunk<
  void,
  { fileIds: Array<number>; detectionModels: Array<DetectionModelType> },
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
    const { jobsByFileId } = getState().processSlice;
    const batchFileIdsList: number[][] = fileIds.reduce((acc, _, i) => {
      if (i % batchSize === 0) {
        acc.push(fileIds.slice(i, i + batchSize));
      }
      return acc;
    }, [] as number[][]);

    batchFileIdsList.forEach((batchFileIds) => {
      detectionModels.forEach((modelType) => {
        const filteredBatchFileIds = batchFileIds.filter((fileId: number) => {
          const existingJobs = jobsByFileId[fileId] || [];
          return !existingJobs.find((job) => job.type === modelType);
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
  { modelType: DetectionModelType; fileIds: number[] },
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
          fileIds.forEach((fileId) => {
            if (doesFileExist(fileId)) {
              dispatch(fileProcessUpdate({ fileId, job: latestJobVersion }));
            }
          });
        },

        onError: (error) => {
          fileIds.forEach((fileId) => {
            dispatch(removeJobByType({ fileId, modelType }));
            // eslint-disable-next-line no-console
            console.error(error); // todo better error handling of polling errors
          });
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
      action: PayloadAction<Array<DetectionModelType>>
    ) {
      state.selectedDetectionModels = action.payload;
    },
    updateJob(
      state,
      action: PayloadAction<{
        fileId: string | number;
        job: AnnotationJob;
      }>
    ) {
      const { fileId, job } = action.payload;
      const existingJobs = state.jobsByFileId[fileId] || [];
      state.jobsByFileId[fileId] = existingJobs.map((existingJob) =>
        existingJob.jobId === job.jobId ? job : existingJob
      );
    },
    removeJobByType(
      state,
      action: PayloadAction<{
        fileId: string | number;
        modelType: DetectionModelType;
      }>
    ) {
      const { fileId, modelType } = action.payload;
      const existingJobs = state.jobsByFileId[fileId] || [];
      state.jobsByFileId[fileId] = existingJobs.filter(
        (existingJob) => existingJob.type !== modelType
      );
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fileProcessUpdate, (state, { payload }) => {
      const { fileId, job } = payload;
      const existingJobs = state.jobsByFileId[fileId] || [];
      state.jobsByFileId[fileId] = existingJobs.map((existingJob) =>
        existingJob.jobId === job.jobId ? job : existingJob
      );
    });

    builder.addCase(deleteFilesById.fulfilled, (state, { payload }) => {
      payload.forEach((fileId) => {
        delete state.jobsByFileId[fileId.id];
      });
    });

    /* postAnnotationJobs */

    builder.addCase(postAnnotationJob.pending, (state, { meta }) => {
      const { fileIds, modelType } = meta.arg;
      fileIds.forEach((fileId) => {
        const existingJobs = state.jobsByFileId[fileId] || [];
        existingJobs.push({
          ...getFakeQueuedJob(),
          type: modelType,
        });
        state.jobsByFileId[fileId] = existingJobs;
      });
    });

    builder.addCase(postAnnotationJob.fulfilled, (state, { payload, meta }) => {
      const newJob = payload;
      const { fileIds, modelType } = meta.arg;
      fileIds.forEach((fileId) => {
        const existingJobs = state.jobsByFileId[fileId] || [];
        state.jobsByFileId[fileId] = existingJobs.map((existingJob) =>
          existingJob.type === modelType ? newJob : existingJob
        );
      });
    });

    builder.addCase(postAnnotationJob.rejected, (state, { error, meta }) => {
      const { fileIds, modelType } = meta.arg;
      fileIds.forEach((fileId) => {
        const existingJobs = state.jobsByFileId[fileId] || [];
        state.jobsByFileId[fileId] = existingJobs.filter(
          (existingJob) => existingJob.type !== modelType
        );
        state.error = error.message;
        // eslint-disable-next-line no-console
        console.error(error); // todo remove later once ui can handle that
      });
    });

    builder.addCase(SaveAvailableAnnotations.fulfilled, (state) => {
      state.selectedFileId = initialState.selectedFileId;
      state.jobsByFileId = initialState.jobsByFileId;
      state.error = initialState.error;
      state.showFileMetadataDrawer = initialState.showFileMetadataDrawer;
      state.selectedDetectionModels = initialState.selectedDetectionModels;
    });
  },
  /* eslint-enable no-param-reassign */
});

export const {
  updateJob,
  removeJobByType,
  setSelectedDetectionModels,
  toggleFileMetadataPreview,
  showFileMetadataPreview,
  setSelectedFileId,
} = processSlice.actions;

export default processSlice.reducer;
