import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchJobById, createAnnotationJob } from 'src/api/annotationJob';
import { fetchUntilComplete } from 'src/utils';
import { AnnotationJob, DetectionModelType } from 'src/api/types';
import { getFakeQueuedJob } from 'src/api/utils';
import { fileProcessUpdate } from 'src/store/commonActions';
import { deleteFilesById } from 'src/store/thunks/deleteFilesById';
import { ThunkConfig } from 'src/store/rootReducer';

type State = {
  selectedFileId: number | null;
  showFileMetadataDrawer: boolean;
  selectedDetectionModels: Array<DetectionModelType>;
  jobsByFileId: Record<string, Array<AnnotationJob> | undefined>;
  error?: string;
};

const BATCHSIZE = 10;

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

    const { jobsByFileId } = getState().processSlice;
    const batchFileIdsList: number[][] = fileIds
      .map((_, i) =>
        i % BATCHSIZE === 0 ? fileIds.slice(i, i + BATCHSIZE) : null
      )
      .filter((x): x is number[] => !!x);

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
          latestJobVersion.status === 'Failed',
        // || !doesFileExist(), // TODO: we don't want to poll jobs for removed files

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
      const currentJob = existingJobs.find(
        (existingJob) => existingJob.jobId === job.jobId
      );
      if (currentJob && currentJob.status !== job.status) {
        state.jobsByFileId[fileId] = existingJobs.map((existingJob) =>
          existingJob.jobId === job.jobId ? job : existingJob
        );
      }
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
  },
  /* eslint-enable no-param-reassign */
});

export const {
  removeJobByType,
  setSelectedDetectionModels,
  toggleFileMetadataPreview,
  showFileMetadataPreview,
  setSelectedFileId,
} = processSlice.actions;

export default processSlice.reducer;
