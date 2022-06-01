import styled from 'styled-components';
import Layers from 'utils/z-index';

export const Table = styled.table`
  border: 0;
  border-collapse: collapse;
  width: 100%;

  th {
    box-shadow: inset 0 -1px 0 var(--cogs-greyscale-grey4);
  }

  td {
    border-bottom: 1px solid var(--cogs-greyscale-grey4);
  }

  td,
  th {
    padding-left: 10px;

    &.bordered {
      border-right: 1px solid var(--cogs-greyscale-grey4);
    }

    &.col-unit {
      padding-right: 8px;
      .unit-btn {
        min-width: 120px;
        height: 28px;
        justify-content: space-between;
      }
    }
  }

  th {
    position: sticky;
    top: -1px;
    color: var(--cogs-greyscale-grey7);
    background-color: var(--cogs-white);
    z-index: ${Layers.TABLE_HEADER};
    margin-bottom: -1px;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
  }

  tbody > tr:hover {
    background: var(--cogs-greyscale-grey3);
  }
`;
