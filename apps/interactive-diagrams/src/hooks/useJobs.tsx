import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from 'reselect';
import { RootState } from 'store';
import {
  useInterval,
  useResourceCount,
  useJobStarted,
  useActiveWorkflow,
} from 'hooks';
import {
  getWorkflowJobs,
  setJobStatus,
  loadWorkflowAsync,
  pollJobResults,
} from 'modules/workflows';
import {
  JobStatus,
  ApiStatusCount,
  PnidsParsingJobSchema,
} from 'modules/types';

export const useStartJobs = () => {
  const dispatch = useDispatch();
  const { workflowId } = useActiveWorkflow();
  const jobs = useSelector(getWorkflowJobs);

  const jobDone = ['done', 'error', 'rejected'];
  const isJobDone = jobDone.includes(jobs?.status);

  const pollJobIfRunning = () => {
    if (jobs?.list?.length && !isJobDone) {
      jobs.list.forEach((job: PnidsParsingJobSchema) => {
        if (!job.jobId || job.status === 'Completed' || job.status === 'Failed')
          return;
        dispatch(
          pollJobResults.action({
            jobId: job.jobId,
            workflowId,
          })
        );
      });
    }
  };
  useInterval(pollJobIfRunning, isJobDone ? null : 5000);

  useEffect(() => {
    dispatch(loadWorkflowAsync(workflowId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflowId]);
};

export const useParsingJob = () => {
  const parsingJob = useSelector(selectParsingJobs);
  return parsingJob;
};

export const useJobStatus = (): JobStatus => {
  const { jobStarted } = useJobStarted();
  const jobs = useSelector(getWorkflowJobs);
  const parsingJob = useParsingJob();
  const allCounts = useResourceCount();
  const dispatch = useDispatch();

  const isSetUpIncomplete =
    !allCounts.diagrams || (!allCounts.files && !allCounts.assets);

  const getJobStatus = (): JobStatus => {
    if (isSetUpIncomplete) return 'incomplete';
    const { statusCount, status } = parsingJob;
    const {
      completed = 0,
      running = 0,
      queued = 0,
      failed = 0,
    } = statusCount ?? {};
    const total = running + completed + queued + failed;

    if (!status) return 'incomplete';
    if (status === 'rejected') return status;
    if (status === 'done') {
      if (total === failed) return 'error';
      if (total > failed) return 'done';
    }
    if (jobs?.list?.length && jobStarted && !total) return 'loading';
    if (!jobStarted) return 'ready';
    if (running) return 'running';
    return status as JobStatus;
  };

  useEffect(() => {
    const newJobStatus = getJobStatus();
    if (newJobStatus && newJobStatus !== jobs?.status) {
      dispatch(setJobStatus({ status: newJobStatus }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsingJob]);

  return jobs?.status ?? 'incomplete';
};

// utils

export const selectParsingJobs = createSelector(
  (state: RootState) => state.workflows.active,
  (state: RootState) => state.workflows.items,
  (workflowId: number, workflowItems): Partial<PnidsParsingJobSchema> => {
    const workflow = workflowItems[workflowId];
    const defaultStatus = { status: workflow?.jobs?.status ?? '' };
    // we don't want to get jobs which ids got removed from active workflow
    if (!workflow?.jobs?.list?.length) return defaultStatus;
    const existingJobs = workflow.jobs.list;
    const jobs = existingJobs.reduce((sum, cur) => {
      const annotationCounts = {
        ...(sum.annotationCounts ?? {}),
        ...(cur.annotationCounts ?? {}),
      };
      const failedFiles = [
        ...(sum.failedFiles ?? []),
        ...(cur.failedFiles ?? []),
      ];
      const newStatusCount = Object.entries(cur.statusCount ?? {}) as [
        keyof ApiStatusCount,
        number
      ][];
      const statusCount = sum.statusCount ?? {};
      newStatusCount.forEach((status) => {
        const [key, value] = status;
        statusCount[key] = (statusCount[key] ?? 0) + value;
      });
      return {
        annotationCounts,
        failedFiles,
        statusCount,
      };
    }, {} as PnidsParsingJobSchema);
    return {
      ...jobs,
      status: getCollectiveStatus(existingJobs),
    };
  }
);

const getCollectiveStatus = (jobs: PnidsParsingJobSchema[]): JobStatus => {
  const jobDoneStatus = ['Completed', 'Failed'];
  const jobRunningStatus = [
    'Queued',
    'Running',
    'Distributing',
    'Distributed',
    'Collecting',
  ];
  if (!jobs.length) return 'incomplete';
  if (jobs.every((job) => job.status === 'Failed')) return 'error';
  if (jobs.every((job) => jobDoneStatus.includes(job?.status ?? '')))
    return 'done';
  if (jobs.some((job) => jobRunningStatus.includes(job?.status ?? '')))
    return 'running';
  return 'ready';
};
