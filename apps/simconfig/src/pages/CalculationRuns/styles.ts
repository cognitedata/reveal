/**
 * Styles for Run list
 */

import styled from 'styled-components/macro';

export const CalculationRunsListContainer = styled.div`
  overflow: auto;
  padding: 0 24px;
  display: grid;
  row-gap: 2px;

  > .grid-row {
    display: grid;
    grid-gap: 0 12px;
    grid-template-columns: 1.5fr auto 5fr auto 1.5fr auto;
    align-items: center;
    transition: background 0.3s cubic-bezier(0.39, 0.575, 0.565, 1);
    border-radius: 6px;
    padding: 4px 6px;

    @media screen and (min-width: 1340px) {
      grid-template-columns: 1fr auto 5fr auto 1fr auto;
    }

    &:hover,
    &:focus {
      background: var(--cogs-greyscale-grey2);
    }

    .date {
      white-space: nowrap;
    }

    .col-status {
      width: 100px;
      display: flex;
      white-space: nowrap;

      > span:first-child {
        margin-right: 6px;
      }
    }
  }

  .cogs-tooltip__content {
    cursor: help;
    display: flex;
    column-gap: 6px;
    align-items: center;
  }
`;
