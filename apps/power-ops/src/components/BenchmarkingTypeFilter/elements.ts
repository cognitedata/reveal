import { Select } from '@cognite/cogs.js-v9';
import styled from 'styled-components';

export const BenchmarkingTypeFilterButton = styled(Select)`
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
  font-weight: 400;

  &[aria-selected='true'] {
    color: var(--cogs-border--interactive--toggled-default);
  }

  p {
    color: var(--cogs-text-icon--muted);
    margin: 0;
    font-weight: 400;
  }
`;

export const BenchmarkingTypeFilterDropdown = styled.div`
  flex: 1;
  max-width: 260px;

  .cogs-menu {
    min-width: 250px;
  }

  .benchmarking-type-dropdown {
    min-width: 150px;

    .cogs-detail {
      color: var(--cogs-text-icon--muted);
      margin: 8px;
      text-align: left;
    }

    .cogs-menu-item {
      &.toggled:hover {
        background-color: var(--cogs-surface--interactive--toggled-default);
      }
    }
  }
`;
