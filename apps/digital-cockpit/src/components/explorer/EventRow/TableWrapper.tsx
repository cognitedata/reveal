import styled from 'styled-components';

export const TableWrapper = styled.table`
  width: 100%;
  .row:nth-child(2n) {
    background: var(--cogs-greyscale-grey1);
  }
  .row.selected {
    background: var(--cogs-midblue-8);
  }
  td {
    padding: 0 24px;
  }
`;
