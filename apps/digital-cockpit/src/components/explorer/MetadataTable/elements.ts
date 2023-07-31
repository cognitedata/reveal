import styled from 'styled-components';

export const ListWraper = styled.div`
  height: 100%;
  overflow: auto;
  .row {
    padding: 12px 16px;
    &:nth-child(2n) {
      background: var(--cogs-greyscale-grey2);
    }
  }

  .field {
    font-weight: 500;
    display: block;
  }
`;

export const TableWrapper = styled.table`
  tr {
    padding: 12px 16px;
    background: var(--cogs-greyscale-grey1);
    &:nth-child(2n) {
      background: var(--cogs-greyscale-grey2);
    }
    td {
      padding: 16px;
    }
  }
`;
