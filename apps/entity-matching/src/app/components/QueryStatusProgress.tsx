import { MutationStatus } from '@tanstack/react-query';
import { Progress } from 'antd';

import { JobStatus } from '../hooks/types';

export const percentFromStatus = (
  status?: MutationStatus | JobStatus
): number => {
  switch (status) {
    case 'idle': {
      return 10;
    }
    case 'loading':
    case 'Queued': {
      return 20;
    }
    case 'Running': {
      return 40;
    }
    case 'success':
    case 'Completed': {
      return 100;
    }
    case 'error':
    case 'Failed': {
      return 100;
    }
    default: {
      return 0;
    }
  }
};

export default function QueryStatusProgress({
  percent,
  status,
}: {
  percent?: number;
  status?: MutationStatus | JobStatus;
}) {
  const p = percent || percentFromStatus(status);
  return <Progress percent={p} status={p === 100 ? 'success' : 'active'} />;
}
