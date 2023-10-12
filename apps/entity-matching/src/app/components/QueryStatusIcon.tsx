import { MutationStatus } from '@tanstack/react-query';

import { Colors, Icon } from '@cognite/cogs.js';

import { JobStatus } from '../hooks/types';

export default function QueryStatusIcon({
  status,
}: {
  status?: MutationStatus | JobStatus;
}) {
  switch (status) {
    case 'loading':
    case 'Running':
    case 'Queued': {
      return (
        <Icon
          css={{ color: Colors['text-icon--status-neutral'] }}
          type="Loader"
        />
      );
    }
    case 'success':
    case 'Completed': {
      return (
        <Icon
          css={{ color: Colors['text-icon--status-neutral'] }}
          type="CheckmarkFilled"
        />
      );
    }
    case 'error':
    case 'Failed': {
      return (
        <Icon
          css={{ color: Colors['text-icon--status-critical'] }}
          type="Error"
        />
      );
    }
    case 'idle': {
      return (
        <Icon
          css={{ color: Colors['text-icon--status-undefined'] }}
          type="Pause"
        />
      );
    }
    default: {
      return (
        <Icon
          css={{ color: Colors['text-icon--status-undefined'] }}
          type="Remove"
        />
      );
    }
  }
}
