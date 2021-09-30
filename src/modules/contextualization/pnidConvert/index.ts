import { createSlice } from '@reduxjs/toolkit';
import { ERRORS } from 'stringConstants';
import { startConvertFileToSvgJob } from './actions';

type State = {
  [key: number]: {
    jobId: number;
    fileId: number;
    status: string;
    svgId?: number;
    errorMessage?: string;
  };
};

export const svgConvertSlice = createSlice({
  name: 'svgConvert',
  initialState: {} as State,
  reducers: {
    createJob: (state, action) => {
      const { fileIds, jobId } = action.payload;
      fileIds.forEach((fileId: number) => {
        state[fileId] = {
          jobId,
          fileId,
          status: 'Queued',
        };
      });
    },
    updateJob: (state, action) => {
      const { jobId, status } = action.payload;
      const fileIds = Object.values(state).map((fileData) => fileData.fileId);
      fileIds.forEach((fileId: number) => {
        state[fileId] = {
          jobId,
          fileId,
          status,
        };
      });
    },
    rejectJob: (state, action) => {
      const { jobId, job } = action.payload;
      const fileIds = Object.values(state).map((fileData) => fileData.fileId);
      fileIds.forEach((fileId: number) => {
        const file = job?.items?.find((item: any) => item.fileId === fileId);
        state[fileId] = {
          jobId,
          fileId,
          status: 'Failed',
          errorMessage: file?.errorMessage ?? ERRORS.SVG_BAD,
        };
      });
    },
    finishJob: (state, action) => {
      const { job } = action.payload;
      const fileIds = Object.values(state).map((fileData) => fileData.fileId);
      fileIds.forEach((fileId: number) => {
        const file = job.items.find((item: any) => item.fileId === fileId);
        state[fileId] = {
          jobId: job.jobId,
          fileId,
          status: file?.errorMessage ? 'Failed' : job.status,
          errorMessage: file?.errorMessage,
          svgId: !file?.errorMessage
            ? job.svgIds.find(
                (ids: { fileId: number; svgId: number }) =>
                  ids.fileId === fileId
              )?.svgId
            : undefined,
        };
      });
    },
  },
});

export const downloadFile = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Network response was not ok.');
  }
  const blob = await response.blob();
  return blob;
};

export { startConvertFileToSvgJob };
export const { reducer } = svgConvertSlice;
export const { createJob, updateJob, rejectJob, finishJob } =
  svgConvertSlice.actions;
