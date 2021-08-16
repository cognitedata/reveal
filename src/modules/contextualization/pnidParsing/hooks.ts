import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { RootState } from 'store';
import { useResourceCount } from 'hooks';

const selectParsingJob = createSelector(
  (state: RootState) => state.workflows.items,
  (state: RootState) => state.contextualization.pnidParsing,
  (workflowItems, parsingData) => (workflowId: number) => {
    const workflow = workflowItems[workflowId];
    //   // we don't want to get the job if its id got removed from active workflow
    if (!workflow.jobId) return { status: '' };
    return parsingData[workflowId] ?? { status: '' };
  }
);

export const useParsingJob = (workflowId: number) => {
  const parsingJob = useSelector(selectParsingJob)(workflowId);
  return parsingJob;
};

export type JobStatus =
  | 'incomplete'
  | 'ready'
  | 'loading'
  | 'running'
  | 'done'
  | 'error';
export const useJobStatus = (workflowId: number, jobInitiated?: boolean) => {
  const [jobStatus, setJobStatus] = useState<JobStatus>('ready');
  const parsingJob = useParsingJob(workflowId);
  const allCounts = useResourceCount();

  const isSetUpIncomplete =
    !allCounts.diagrams || (!allCounts.files && !allCounts.assets);

  const getJobStatus = (): JobStatus | undefined => {
    if (isSetUpIncomplete) return 'incomplete';
    const { statusCount, status: parsingJobStatus, jobId } = parsingJob;
    const {
      completed = 0,
      running = 0,
      queued = 0,
      failed = 0,
    } = statusCount ?? {};
    const total = running + completed + queued + failed;
    if (parsingJobStatus === 'Completed') {
      if (total === failed) return 'error';
      if (total > failed) return 'done';
    }
    if (parsingJobStatus === 'Failed') {
      return 'error';
    }
    if (!jobId || !jobInitiated) {
      return 'ready';
    }
    if (jobInitiated && !total) {
      return 'loading';
    }
    if (running) {
      return 'running';
    }
    return undefined;
  };

  useEffect(() => {
    const newJobStatus = getJobStatus();
    if (newJobStatus && newJobStatus !== jobStatus) setJobStatus(newJobStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsingJob]);

  return jobStatus;
};
