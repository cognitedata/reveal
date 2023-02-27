import styled from 'styled-components';

export const CellEditorWrapper = styled.div`
  width: auto;
  padding: var(--ag-cell-vertical-padding) var(--ag-cell-horizontal-padding);

  .cogs-tooltip__content {
    display: inline-block;
    width: 100%;
  }
`;

export const ErrorLabel = styled.div`
  .cogs-label {
    border: 1px solid rgba(168, 54, 28, 1);
  }
`;
