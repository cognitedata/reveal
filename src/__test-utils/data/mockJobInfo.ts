import { VisionDetectionModelType } from 'src/api/vision/detectionModels/types';
import { JobState } from 'src/modules/Process/store/types';

export const jobIds: number[] = [100, 200, 300, 400, 500];
export const filesWithJobs: Record<number, { jobIds: number[] }> = {
  1: { jobIds: [100, 200, 500] },
  2: { jobIds: [100, 200, 300, 500] },
  3: { jobIds: [100, 200, 300, 500] },
  4: { jobIds: [100, 200, 300, 500] },
  5: { jobIds: [100, 200, 300, 500] },
  6: { jobIds: [100, 200, 300, 500] },
  7: { jobIds: [100, 200, 300] },
  8: { jobIds: [100, 200, 300] },
  9: { jobIds: [100, 200, 300] },
  10: { jobIds: [100, 200, 400] },
  11: { jobIds: [100, 200, 400] },
  12: { jobIds: [100, 200, 400] },
};
export const queuedJob: JobState = {
  jobId: 100,
  type: VisionDetectionModelType.OCR,
  status: 'Queued',
  createdTime: 1643352030229,
  statusTime: 1643352030229,
  startTime: null,
  fileIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
};
export const runningJob: JobState = {
  jobId: 200,
  type: VisionDetectionModelType.ObjectDetection,
  status: 'Running',
  createdTime: 1643352030229,
  statusTime: 1643352030229,
  startTime: 1643352030660,
  fileIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
};
export const completedJob: JobState = {
  jobId: 300,
  type: VisionDetectionModelType.TagDetection,
  status: 'Completed',
  createdTime: 1643352030229,
  statusTime: 1643352030229,
  startTime: 1643352030660,
  fileIds: [2, 3, 4, 5, 6, 7, 8, 9],
  completedFileIds: [2, 3, 4, 5, 6, 7, 8, 9],
  items: [
    {
      annotations: [
        {
          assetIds: [547950361720898],
          confidence: 1.0,
          region: {
            shape: 'rectangle',
            vertices: [
              {
                x: 0.8002450980392157,
                y: 0.36887254901960786,
              },
              {
                x: 0.8477328431372549,
                y: 0.39419934640522875,
              },
            ],
          },
          text: '80-6K-134-T01',
        },
        {
          assetIds: [547950361720898],
          confidence: 0.25,
          region: {
            shape: 'rectangle',
            vertices: [
              {
                x: 0.7993259803921569,
                y: 0.4048202614379085,
              },
              {
                x: 0.8462009803921569,
                y: 0.4276960784313726,
              },
            ],
          },
          text: '80-6K-134-T01',
        },
      ],
      fileId: 2,
      height: 2448,
      width: 3264,
    },
    {
      annotations: [],
      fileId: 3,
      height: 1056,
      width: 1881,
    },
  ],
};
export const failedJob: JobState = {
  jobId: 400,
  type: VisionDetectionModelType.TagDetection,
  status: 'Failed',
  createdTime: 1643352030229,
  statusTime: 1643352030229,
  startTime: null,
  fileIds: [10, 11, 12],
  failedFileIds: [10, 11, 12],
};
export const partiallyCompletedJob: JobState = {
  jobId: 500,
  type: VisionDetectionModelType.TagDetection,
  status: 'Running',
  createdTime: 1643352030229,
  statusTime: 1643352030229,
  startTime: 1643352030660,
  fileIds: [1, 2, 3, 4, 5, 6],
  completedFileIds: [1, 2, 3],
  items: [
    {
      annotations: [
        {
          assetIds: [547950361720898],
          confidence: 1.0,
          region: {
            shape: 'rectangle',
            vertices: [
              {
                x: 0.8002450980392157,
                y: 0.36887254901960786,
              },
              {
                x: 0.8477328431372549,
                y: 0.39419934640522875,
              },
            ],
          },
          text: '80-6K-134-T01',
        },
        {
          assetIds: [547950361720898],
          confidence: 0.25,
          region: {
            shape: 'rectangle',
            vertices: [
              {
                x: 0.7993259803921569,
                y: 0.4048202614379085,
              },
              {
                x: 0.8462009803921569,
                y: 0.4276960784313726,
              },
            ],
          },
          text: '80-6K-134-T01',
        },
      ],
      fileId: 2,
      height: 2448,
      width: 3264,
    },
  ],
};

export const jobState: Record<number, JobState> = {
  100: queuedJob,
  200: runningJob,
  300: completedJob,
  400: failedJob,
  500: partiallyCompletedJob,
};
