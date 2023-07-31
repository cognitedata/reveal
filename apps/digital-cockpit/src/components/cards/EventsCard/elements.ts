import { Button } from '@cognite/cogs.js';
import styled from 'styled-components';

export const EventList = styled.div`
  width: 100%;
  height: 100%;
  overflow: auto;
  .row {
    display: flex;
    padding: 4px 8px;
    justify-content: space-between;
    &:nth-child(2n) {
      background: var(--cogs-greyscale-grey1);
    }
  }
`;

export const TypeButton = styled(Button)`
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 8px;
  border-bottom: 1px solid var(--cogs-greyscale-grey3);
  cursor: pointer;
  .value {
    font-weight: 500;
  }
  .count {
    opacity: 0.7;
  }

  &:hover {
    display: flex;
    border-bottom: 1px solid var(--cogs-primary);
  }
`;
