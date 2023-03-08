import { Colors, Icon } from '@cognite/cogs.js';
import { MutationStatus } from '@tanstack/react-query';

export default function QueryStatusIcon({
  status,
}: {
  status?: MutationStatus;
}) {
  switch (status) {
    case 'loading': {
      return (
        <Icon
          css={{ color: Colors['text-icon--status-neutral'] }}
          type="Loader"
        />
      );
    }
    case 'success': {
      return (
        <Icon
          css={{ color: Colors['text-icon--status-success'] }}
          type="Checkmark"
        />
      );
    }
    case 'error': {
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
      return null;
    }
  }
}
