import { Colors, Icon } from '@cognite/cogs.js';
import { MutationStatus } from '@tanstack/react-query';
import { JobStatus } from 'hooks/types';

import styled from 'styled-components';

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
        <StyledIcon
          css={{ color: Colors['text-icon--status-neutral'] }}
          type="Loader"
        />
      );
    }
    case 'success':
    case 'Completed': {
      return (
        <StyledIcon
          css={{ color: Colors['text-icon--on-contrast--strong'] }}
          type="Checkmark"
        />
      );
    }
    case 'error':
    case 'Failed': {
      return (
        <StyledIcon
          css={{ color: Colors['text-icon--status-critical'] }}
          type="Error"
        />
      );
    }
    case 'idle': {
      return (
        <StyledIcon
          css={{ color: Colors['text-icon--on-contrast--strong'] }}
          type="Pause"
        />
      );
    }
    default: {
      return null;
    }
  }
}

const StyledIcon = styled(Icon)`
  margin-left: 0.5rem;
`;
