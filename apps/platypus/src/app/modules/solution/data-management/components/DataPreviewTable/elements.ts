import styled from 'styled-components';

export const CollapsablePanelContainer = styled.div`
  height: 100%;
  .cp-right-panel .cp-panel-content {
    height: 100%;
  }
`;

export const StyledDataPreviewTable = styled.div`
  height: 100%;
  background-color: var(--cogs-surface--medium);

  .ag-cell {
    display: flex;
    align-items: center;
    .ag-cell-wrapper {
      width: 100%;
    }
  }
  .ag-cell[col-id='_isDraftSelected'] {
    text-align: center;
    background: transparent !important;

    > .ag-cell-wrapper {
      display: inline-block;
      background: transparent;
    }
  }
  .ag-overlay {
    pointer-events: all;
  }
  .ag-row .network {
    opacity: 0;
    transition: 0.2s all;
  }
  .ag-row:hover .network {
    opacity: 1;
  }
  .ag-root-wrapper-body {
    min-height: 300px;
  }
`;

export const NoRowsOverlay = styled.span`
  padding: 10px;
  background: transparent;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 400px;
`;

export const NoRowsOverlayButtons = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

export const PageHeaderDivider = styled.div`
  width: 1px;
  background-color: rgba(0, 0, 0, 0.15);
`;
