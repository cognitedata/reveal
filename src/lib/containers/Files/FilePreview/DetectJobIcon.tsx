import React from 'react';
import { Icon } from '@cognite/cogs.js';
import { useJob } from 'lib/hooks/objectDetection';
import { isModelRunning } from 'lib/types';

export const DetectJobIcon = ({ jobId }: { jobId?: number }) => {
  const { data: job } = useJob(jobId);
  const running = !!jobId && isModelRunning(job?.status);
  if (running) {
    return <Icon type="Loading" />;
  }
  switch (job?.status) {
    case 'Completed':
      return <Icon type="Check" />;
    case 'Failed':
      return <Icon type="Beware" />;
    default:
      return <Icon type="ThreeD" />;
  }
};
export default DetectJobIcon;
