import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchJobById, putFilesToProcessingQueue } from 'src/api/annotationJob';
import { RootState } from 'src/store/rootReducer';
import { fetchUntilComplete } from 'src/utils';
import { AnnotationJobResponse, DetectionModelType } from 'src/api/types';

type State = {
  selectedDetectionModels: Array<any>;
  jobByFileId: Record<string, AnnotationJobResponse | undefined>;
  error?: string;
};

type ThunkConfig = { state: RootState };

const modelType = DetectionModelType.Text; // todo: refactor

const initialState: State = {
  selectedDetectionModels: [DetectionModelType.Text],
  jobByFileId: {},
  error: undefined,
};

// create annotation jobs for every file and run polling for each of them
export const detectAnnotations = createAsyncThunk<void, void, ThunkConfig>(
  'process/detectAnnotations',
  async (_, { dispatch, getState }) => {
    const fileIds = getState()
      .uploadedFiles.uploadedFiles.filter(
        (file) =>
          // for now we don't need to post more jobs for a file that already have some
          // later when files will have more than one job associated, we'll need to check job type here
          !getState().processSlice.jobByFileId[file.id]
      )
      .map((file) => file.id);

    await dispatch(postAnnotationJobs(fileIds));

    const { jobByFileId } = getState().processSlice;

    fileIds.forEach((fileId) => {
      const job = jobByFileId[fileId];
      if (!job) {
        console.warn('File has no job scheduled', fileId); // should never happen
        return;
      }
      const { status, jobId } = job;
      if (
        !(status === 'COMPLETED' || status === 'FAILED') &&
        jobId !== -1 /* fake jobId for optimistic update */
      ) {
        dispatch(pollAnnotationJobStatus({ fileId, jobId }));
      }
    });
  }
);

const postAnnotationJobs = createAsyncThunk<
  Record<string, AnnotationJobResponse>,
  Array<number>
>('process/postAnnotationJobs', async (fileIds) => {
  const response = await putFilesToProcessingQueue(modelType, fileIds);
  return fileIds.reduce((acc, fileId, index) => {
    acc[fileId] = response[index]; // not nice, but API doesn't return fileId back

    return acc;
  }, {} as Record<string, AnnotationJobResponse>);
});

const pollAnnotationJobStatus = createAsyncThunk<
  AnnotationJobResponse,
  { fileId: number; jobId: number },
  ThunkConfig
>(
  'process/pollFileAnnotationJobStatus',
  ({ fileId, jobId }, { dispatch, getState }) => {
    const fileStillExist = () =>
      getState().uploadedFiles.uploadedFiles.find((file) => file.id === fileId);

    return new Promise((resolve, reject) => {
      return fetchUntilComplete<AnnotationJobResponse>(
        () => fetchJobById(modelType, jobId),
        {
          isCompleted: (job) =>
            job.status === 'COMPLETED' ||
            job.status === 'FAILED' ||
            !fileStillExist(), // we don't want to poll jobs for removed files

          onTick: (job) => {
            if (fileStillExist()) {
              dispatch(updateJob({ fileId, job }));
            }
          },

          onComplete: resolve,
          onError: reject,
        }
      );
    });
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
        job: AnnotationJobResponse;
      }>
    ) {
      const { fileId, job } = action.payload;
      state.jobByFileId[fileId] = job;
    },
  },
  extraReducers: (builder) => {
    /* postAnnotationJobs */

    builder.addCase(postAnnotationJobs.pending, (state, { meta }) => {
      state.jobByFileId = meta.arg.reduce((acc, fileId) => {
        const now = Date.now();
        acc[fileId] = {
          createdTime: now,
          jobId: -1,
          startTime: null,
          status: 'QUEUED',
          statusTime: now,
        };
        return acc;
      }, {} as Record<string, AnnotationJobResponse>);
    });

    builder.addCase(postAnnotationJobs.fulfilled, (state, { payload }) => {
      state.jobByFileId = payload;
    });

    builder.addCase(postAnnotationJobs.rejected, (state, { error }) => {
      state.jobByFileId = {};
      state.error = error.message;
      console.error(error); // todo remove later once ui can handle that
    });

    /* pollAnnotationJobStatus */

    builder.addCase(
      pollAnnotationJobStatus.fulfilled,
      (state, { payload, meta }) => {
        const { fileId } = meta.arg;
        state.jobByFileId[fileId] = payload;
      }
    );

    builder.addCase(pollAnnotationJobStatus.rejected, (state, { error }) => {
      state.error = error.message;
      console.error(error); // todo remove later once ui can handle that
    });
  },
  /* eslint-enable no-param-reassign */
});

export const { updateJob, setSelectedDetectionModels } = processSlice.actions;

export default processSlice.reducer;
