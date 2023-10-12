import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { ChipProps } from '@cognite/cogs.js';

import { JobStatus } from '../modules/types';
import { useWorkflowLoadPercentages } from '../modules/workflows/hooks';
import { getActiveWorkflowId } from '../modules/workflows/selectors';
import ResourcesLoaded from '../pages/PageResultsOverview/SectionResults/ResourcesLoaded';

import { useJobStatus } from './';

export const useJobStatusLabels = () => {
  const jobStatus = useJobStatus();
  const activeWorkflowId = useSelector(getActiveWorkflowId);
  const {
    loadedPercent: assetsLoadedPercent,
    isLoaded: assetsLoaded,
    totalCount: assetsTotalCount,
  } = useWorkflowLoadPercentages(activeWorkflowId, 'assets');

  const labels = jobStatus ? statusLabels[jobStatus] : defaultStatusLabel;

  const [jobLabel, setJobLabel] = useState(labels.jobLabel);
  const [labelVariant, setLabelVariant] = useState<ChipProps['type']>(
    labels.labelVariant
  );
  const [buttonLabel, setButtonLabel] = useState(labels.buttonLabel);

  useEffect(() => {
    if (!assetsLoaded && assetsTotalCount !== 0) {
      setJobLabel(`Assets downloading ${assetsLoadedPercent}%`);
      setLabelVariant('neutral');
      setButtonLabel('Run model');
    } else {
      setJobLabel(labels.jobLabel);
      setLabelVariant(labels.labelVariant);
      setButtonLabel(labels.buttonLabel);
    }
  }, [
    assetsLoaded,
    assetsLoadedPercent,
    assetsTotalCount,
    jobStatus,
    labels.buttonLabel,
    labels.jobLabel,
    labels.labelVariant,
  ]);

  return { buttonLabel, jobLabel, labelVariant };
};

type StatusLabel = {
  jobLabel: string;
  labelVariant: ChipProps['type'];
  buttonLabel: string | React.ReactNode;
};

const statusLabels: { [key in JobStatus]: StatusLabel } = {
  incomplete: {
    jobLabel: 'Waiting',
    labelVariant: 'default',
    buttonLabel: 'Run',
  },
  ready: {
    jobLabel: 'Ready to run',
    labelVariant: 'default',
    buttonLabel: 'Run model',
  },
  loading: {
    jobLabel: 'Running...',
    labelVariant: 'neutral',
    buttonLabel: <ResourcesLoaded />,
  },
  running: {
    jobLabel: 'In progress',
    labelVariant: 'neutral',
    buttonLabel: 'Running...',
  },
  done: {
    jobLabel: 'Done',
    labelVariant: 'success',
    buttonLabel: 'Done',
  },
  rejected: {
    // [TODO] differentiate that from error
    jobLabel: 'Failed',
    labelVariant: 'warning',
    buttonLabel: 'Re-run model',
  },
  error: {
    jobLabel: 'Failed',
    labelVariant: 'warning',
    buttonLabel: 'Re-run model',
  },
};

const defaultStatusLabel: StatusLabel = {
  jobLabel: 'Awaiting',
  labelVariant: 'warning',
  buttonLabel: 'Please wait...',
};
