/* eslint-disable  no-param-reassign */

import {
  VisionJob,
  VisionJobCompleted,
  VisionJobRunning,
  VisionDetectionModelType,
  VisionJobFailed,
} from '@vision/api/vision/detectionModels/types';
import {
  AnnotationsBadgeStatuses,
  AnnotationStatuses,
} from '@vision/modules/Common/types';
import isEqual from 'lodash/isEqual';

import { ProcessState, JobState } from './types';

export const removeJobFromFiles = (state: ProcessState, jobId: number) => {
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

export const addJobToState = (
  state: ProcessState,
  fileIds: number[],
  job: VisionJob,
  modelType: VisionDetectionModelType,
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

  if (
    job.status === 'Completed' ||
    job.status === 'Running' ||
    job.status === 'Failed'
  ) {
    jobState.failedFiles = (
      job as VisionJobRunning | VisionJobCompleted | VisionJobFailed
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

// helpers
export const isProcessingFile = (
  annotationStatuses: AnnotationsBadgeStatuses
) => {
  const statuses = Object.keys(annotationStatuses) as Array<
    keyof AnnotationsBadgeStatuses
  >;
  return statuses.some((key) =>
    ['Queued', 'Collecting', 'Running'].includes(
      annotationStatuses[key]?.status || ''
    )
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
