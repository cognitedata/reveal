import { Button } from '@cognite/cogs.js';
import styled from 'styled-components/macro';

export const DeliveryWeekButton = styled(Button)`
  :focus {
    border: 2px solid var(--cogs-border--status-neutral--strong);

    :hover {
      background-color: transparent;
    }
  }

  :hover {
    background: var(--cogs-btn-color-secondary);
    cursor: default;
  }
`;

export const MenuItem = styled.div`
  display: flex;
  text-align: left;
  font-family: 'Inter';
  font-weight: 400;

  &::not(.selected) {
    color: var(--cogs-text-icon--medium);
  }

  p {
    color: var(--cogs-text-icon--muted);
    margin: 0;
    font-weight: 400;
  }

  .cogs-icon {
    margin: 0 0 0 8px;
    align-items: flex-start;
  }
`;
