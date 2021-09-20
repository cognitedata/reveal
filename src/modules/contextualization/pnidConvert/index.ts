import { createSlice } from '@reduxjs/toolkit';
import { startConvertFileToSvgJob } from './actions';

type State = {
  [key: number]: {
    jobId: number;
    fileId: number;
    status: string;
    svgId?: number;
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
      const { jobId } = action.payload;
      const fileIds = Object.values(state).map((fileData) => fileData.fileId);
      fileIds.forEach((fileId: number) => {
        state[fileId] = {
          jobId,
          fileId,
          status: 'Failed',
        };
      });
    },
    finishJob: (state, action) => {
      const { job } = action.payload;
      const fileIds = Object.values(state).map((fileData) => fileData.fileId);
      fileIds.forEach((fileId: number) => {
        state[fileId] = {
          jobId: job.jobId,
          fileId,
          status: job.status,
          svgId: job.svgIds.find(
            (ids: { fileId: number; svgId: number }) => ids.fileId === fileId
          )?.svgId,
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
