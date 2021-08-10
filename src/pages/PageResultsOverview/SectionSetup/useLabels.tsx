import { useState, useEffect } from 'react';
import { LabelVariants } from '@cognite/cogs.js';
import { useJobStatus } from 'modules/contextualization/pnidParsing';
import { useActiveWorkflow } from 'hooks';

export const useLabels = (jobStarted: boolean) => {
  const { workflowId } = useActiveWorkflow();
  const jobStatus = useJobStatus(workflowId, jobStarted);

  const [buttonLabel, setButtonLabel] = useState('Run model');
  const [jobLabel, setJobLabel] = useState('Ready to run');
  const [labelVariant, setLabelVariant] = useState<LabelVariants>('default');

  useEffect(() => {
    switch (jobStatus) {
      case 'ready': {
        setJobLabel('Ready to run');
        setLabelVariant('default');
        setButtonLabel('Run model');
        break;
      }
      case 'loading': {
        setJobLabel('Running...');
        setLabelVariant('normal');
        setButtonLabel('Loading resources...');
        break;
      }
      case 'running': {
        setJobLabel('In progress');
        setLabelVariant('normal');
        setButtonLabel('Running...');
        break;
      }
      case 'done': {
        setJobLabel('Done');
        setLabelVariant('success');
        setButtonLabel('Done');
        break;
      }
      case 'error': {
        setJobLabel('Failed');
        setLabelVariant('warning');
        setButtonLabel('Re-run model');
        break;
      }
      default:
        break;
    }
  }, [jobStatus]);

  return { buttonLabel, jobLabel, labelVariant };
};
