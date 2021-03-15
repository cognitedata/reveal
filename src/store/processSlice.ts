import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchJobById, createAnnotationJob } from 'src/api/annotationJob';
import { RootState } from 'src/store/rootReducer';
import { fetchUntilComplete } from 'src/utils';
import { AnnotationJob, DetectionModelType } from 'src/api/types';
import { getFakeQueuedJob } from 'src/api/utils';

type State = {
  selectedDetectionModels: Array<DetectionModelType>;
  jobsByFileId: Record<string, Array<AnnotationJob> | undefined>;
  error?: string;
};

type ThunkConfig = { state: RootState };

const initialState: State = {
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

    const { jobsByFileId } = getState().processSlice;
    // TODO: send batch of files
    fileIds.forEach((fileId) => {
      detectionModels.forEach((modelType) => {
        const existingJobs = jobsByFileId[fileId] || [];
        if (!existingJobs.find((job) => job.type === modelType)) {
          dispatch(postAnnotationJob({ modelType, fileId }));
        }
      });
    });
  }
);

// for passed fileId create job and setup polling on it
export const postAnnotationJob = createAsyncThunk<
  AnnotationJob,
  { modelType: DetectionModelType; fileId: number },
  ThunkConfig
>(
  'process/postAnnotationJobs',
  async ({ modelType, fileId }, { dispatch, getState }) => {
    const createdJob = await createAnnotationJob(modelType, fileId);

    const doesFileExist = () =>
      getState().uploadedFiles.uploadedFiles.find((file) => file.id === fileId);

    fetchUntilComplete<AnnotationJob>(
      () => fetchJobById(createdJob.type, createdJob.jobId),
      {
        isCompleted: (latestJobVersion) =>
          latestJobVersion.status === 'Completed' ||
          latestJobVersion.status === 'Failed' ||
          !doesFileExist(), // we don't want to poll jobs for removed files

        onTick: (latestJobVersion) => {
          if (doesFileExist()) {
            dispatch(updateJob({ fileId, job: latestJobVersion }));
          }
        },

        onError: (error) => {
          dispatch(removeJobByType({ fileId, modelType }));
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
    /* postAnnotationJobs */

    builder.addCase(postAnnotationJob.pending, (state, { meta }) => {
      const { fileId, modelType } = meta.arg;
      const existingJobs = state.jobsByFileId[fileId] || [];
      existingJobs.push({
        ...getFakeQueuedJob(),
        type: modelType,
      });
      state.jobsByFileId[fileId] = existingJobs;
    });

    builder.addCase(postAnnotationJob.fulfilled, (state, { payload, meta }) => {
      const newJob = payload;
      const { fileId, modelType } = meta.arg;
      const existingJobs = state.jobsByFileId[fileId] || [];
      state.jobsByFileId[fileId] = existingJobs.map((existingJob) =>
        existingJob.type === modelType ? newJob : existingJob
      );
    });

    builder.addCase(postAnnotationJob.rejected, (state, { error, meta }) => {
      const { fileId, modelType } = meta.arg;
      const existingJobs = state.jobsByFileId[fileId] || [];
      state.jobsByFileId[fileId] = existingJobs.filter(
        (existingJob) => existingJob.type !== modelType
      );
      state.error = error.message;
      // eslint-disable-next-line no-console
      console.error(error); // todo remove later once ui can handle that
    });
  },
  /* eslint-enable no-param-reassign */
});

export const {
  updateJob,
  removeJobByType,
  setSelectedDetectionModels,
} = processSlice.actions;

export default processSlice.reducer;
