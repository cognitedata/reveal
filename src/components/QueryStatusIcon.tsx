import { Colors, Icon } from '@cognite/cogs.js';
import { MutationStatus } from '@tanstack/react-query';
import styled from 'styled-components';

export default function QueryStatusIcon({
  status,
}: {
  status?: MutationStatus;
}) {
  switch (status) {
    case 'loading': {
      return (
        <StyledIcon
          css={{ color: Colors['text-icon--status-neutral'] }}
          type="Loader"
        />
      );
    }
    case 'success': {
      return (
        <StyledIcon
          css={{ color: Colors['text-icon--on-contrast--strong'] }}
          type="Checkmark"
        />
      );
    }
    case 'error': {
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
