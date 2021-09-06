import { useState, useEffect, useContext } from 'react';
import { LabelVariants } from '@cognite/cogs.js';
import { AppStateContext } from 'context';
import { JobStatus } from 'modules/types';
import { useJobStatus } from 'modules/contextualization/pnidParsing';
import { useActiveWorkflow } from 'hooks';

export const useJobStatusLabels = () => {
  const { workflowId } = useActiveWorkflow();
  const { jobStarted } = useContext(AppStateContext);
  const jobStatus = useJobStatus(workflowId, jobStarted);

  const [jobLabel, setJobLabel] = useState(statusLabels[jobStatus].jobLabel);
  const [labelVariant, setLabelVariant] = useState<LabelVariants>(
    statusLabels[jobStatus].labelVariant
  );
  const [buttonLabel, setButtonLabel] = useState(
    statusLabels[jobStatus].buttonLabel
  );

  useEffect(() => {
    setJobLabel(statusLabels[jobStatus].jobLabel);
    setLabelVariant(statusLabels[jobStatus].labelVariant);
    setButtonLabel(statusLabels[jobStatus].buttonLabel);
  }, [jobStatus]);

  return { buttonLabel, jobLabel, labelVariant };
};

type StatusLabels = {
  [key in JobStatus]: {
    jobLabel: string;
    labelVariant: LabelVariants;
    buttonLabel: string;
  };
};

const statusLabels: StatusLabels = {
  incomplete: {
    jobLabel: 'Waiting',
    labelVariant: 'unknown',
    buttonLabel: 'Run',
  },
  ready: {
    jobLabel: 'Ready to run',
    labelVariant: 'default',
    buttonLabel: 'Run model',
  },
  loading: {
    jobLabel: 'Running...',
    labelVariant: 'normal',
    buttonLabel: 'Loading resources...',
  },
  running: {
    jobLabel: 'In progress',
    labelVariant: 'normal',
    buttonLabel: 'Running...',
  },
  done: {
    jobLabel: 'Done',
    labelVariant: 'success',
    buttonLabel: 'Done',
  },
  error: {
    jobLabel: 'Failed',
    labelVariant: 'warning',
    buttonLabel: 'Re-run model',
  },
};
