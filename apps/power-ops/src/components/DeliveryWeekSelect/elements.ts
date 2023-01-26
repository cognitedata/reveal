import { Select } from '@cognite/cogs.js-v9';
import styled from 'styled-components';

export const DeliveryWeekButton = styled(Select)`
  max-width: 220px;

  .cogs-select__control {
    cursor: default;
  }

  .cogs-select__menu {
    display: none;
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
