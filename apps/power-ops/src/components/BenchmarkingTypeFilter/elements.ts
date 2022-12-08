import { Button } from '@cognite/cogs.js';
import styled from 'styled-components/macro';

export const BenchmarkingTypeFilterButton = styled(Button)`
  width: 100%;
  justify-content: flex-start;

  .type-text {
    white-space: nowrap;
  }

  .cogs-icon {
    color: var(--cogs-greyscale-grey6);
    margin-left: auto;
  }

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
  margin-right: 8px;

  .benchmarking-type-dropdown {
    min-width: 250px;

    .cogs-detail {
      color: var(--cogs-text-icon--muted);
      margin: 8px;
      text-align: left;
    }

    .cogs-menu-item {
      &.selected:hover {
        background-color: var(--cogs-surface--interactive--toggled-default);
      }
    }
  }
`;
