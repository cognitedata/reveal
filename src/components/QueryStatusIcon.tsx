import { Icon } from '@cognite/cogs.js';
import { MutationStatus } from '@tanstack/react-query';

export default function QueryStatusIcon({
  status,
}: {
  status?: MutationStatus;
}) {
  switch (status) {
    case 'loading': {
      return <Icon type="Loader" />;
    }
    case 'success': {
      return <Icon type="Checkmark" />;
    }
    case 'error': {
      return <Icon type="Error" />;
    }
    case 'idle': {
      return <Icon type="Pause" />;
    }
    default: {
      return null;
    }
  }
}
