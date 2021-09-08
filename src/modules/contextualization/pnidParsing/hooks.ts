import { useEffect, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from 'reselect';
import { usePermissions } from '@cognite/sdk-react-query-hooks';
import { AppStateContext } from 'context';
import { RootState } from 'store';
import { useResourceCount } from 'hooks';
import { startPnidParsingWorkflow } from 'modules/contextualization/pnidWorkflow';
import { JobStatus } from 'modules/types';
import { getActiveWorkflowJobId } from 'modules/workflows';

export const selectParsingJob = createSelector(
  (state: RootState) => state.workflows.items,
  (state: RootState) => state.contextualization.pnidParsing,
  (workflowItems, parsingData) => (workflowId: number) => {
    const workflow = workflowItems[workflowId];
    // we don't want to get the job if its id got removed from active workflow
    if (!workflow.jobId) return { status: '' };
    return parsingData[workflowId] ?? { status: '' };
  }
);

export const useParsingJob = (workflowId: number) => {
  const { jobStarted, setJobStarted } = useContext(AppStateContext);
  const canEditFiles = usePermissions('filesAcl', 'WRITE');
  const canReadFiles = usePermissions('filesAcl', 'READ');
  const dispatch = useDispatch();

  const parsingJob = useSelector(selectParsingJob)(workflowId);
  const jobId = useSelector(getActiveWorkflowJobId);

  useEffect(() => {
    const shouldShowJobResults =
      jobId &&
      !jobStarted &&
      !parsingJob.status &&
      canEditFiles &&
      canReadFiles;
    if (shouldShowJobResults) {
      dispatch(startPnidParsingWorkflow.action(workflowId));
      setJobStarted(true);
    }
  }, [
    canEditFiles,
    canReadFiles,
    dispatch,
    jobId,
    jobStarted,
    parsingJob.status,
    setJobStarted,
    workflowId,
  ]);

  return parsingJob;
};

export const useJobStatus = (workflowId: number, jobInitiated?: boolean) => {
  const { jobStatus, setJobStatus } = useContext(AppStateContext);
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
    if (newJobStatus && newJobStatus !== jobStatus) {
      setJobStatus(newJobStatus);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsingJob]);

  return jobStatus;
};
