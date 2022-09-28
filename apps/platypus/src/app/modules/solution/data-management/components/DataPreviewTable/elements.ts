import styled from 'styled-components';

export const StyledDataPreviewTable = styled.div`
  height: 100%;
  background-color: var(--cogs-surface--medium);
  .ag-cell[col-id='_isDraftSelected'] {
    text-align: center;
    background: transparent !important;

    > .ag-cell-wrapper {
      display: inline-block;
      background: transparent;
    }
  }
`;
