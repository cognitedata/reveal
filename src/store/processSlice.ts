import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  AnnotationJobResponse,
  fetchJobById,
  putFilesToProcessingQueue,
} from 'src/api/annotationJob';

type State = {
  jobByFileId: Record<string, AnnotationJobResponse | undefined>;
  error?: string;
};

const initialState: State = {
  jobByFileId: {},
  error: undefined,
};

export const pollAnnotationJobStatus = createAsyncThunk<
  AnnotationJobResponse,
  number
>('process/pollFileAnnotationJobStatus', (jobId) => {
  return fetchJobById(jobId);
});

export const detectAnnotations = createAsyncThunk<
  Record<string, AnnotationJobResponse>,
  Array<number>
>('process/detectAnnotations', async (fileIds) => {
  const response = await putFilesToProcessingQueue(fileIds);
  return fileIds.reduce((acc, fileId, index) => {
    acc[fileId] = response[index]; // not nice, but API doesn't return fileId back

    return acc;
  }, {} as Record<string, AnnotationJobResponse>);
});

const processSlice = createSlice({
  name: 'processSlice',
  initialState,
  /* eslint-disable no-param-reassign */
  reducers: {},
  extraReducers: (builder) => {
    /* detectAnnotations */

    builder.addCase(detectAnnotations.pending, (state, { meta }) => {
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

    builder.addCase(detectAnnotations.fulfilled, (state, { payload }) => {
      state.jobByFileId = payload;
    });

    builder.addCase(detectAnnotations.rejected, (state, { error }) => {
      state.jobByFileId = {};
      state.error = error.message;
      console.error(error); // todo remove later once ui can handle that
    });

    /* pollAnnotationJobStatus */

    builder.addCase(
      pollAnnotationJobStatus.fulfilled,
      (state, { payload, meta }) => {
        const jobId = meta.arg;
        const fileId = Object.keys(state.jobByFileId).find((fileIdKey) => {
          return state.jobByFileId[fileIdKey]?.jobId === jobId;
        });
        if (fileId) {
          state.jobByFileId[fileId] = payload;
        }
      }
    );

    builder.addCase(pollAnnotationJobStatus.rejected, (state, { error }) => {
      state.error = error.message;
      console.error(error); // todo remove later once ui can handle that
    });
  },
  /* eslint-enable no-param-reassign */
});

export default processSlice.reducer;
