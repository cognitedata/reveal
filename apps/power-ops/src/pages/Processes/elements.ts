import { Icon } from '@cognite/cogs.js';
import styled from 'styled-components/macro';

export const Header = styled.header`
  min-height: 10vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  color: var(--cogs-greyscale-grey7);
  padding: 20px;
`;

export const StyledTable = styled.table`
  text-align: left;
  border-radius: 8px;
  font-family: 'Inter';
  overflow: hidden;
  margin-bottom: 12px;

  thead {
    tr {
      background: #f5f5f5;
      border-top: none;

      th {
        padding: 8px 16px 8px 16px;
        color: var(--cogs-text-primary);
        font-weight: 500;
      }
    }
  }

  tbody {
    tr {
      color: var(--cogs-text-secondary);
      border-top: 1px solid var(--cogs-bg-control--disabled);
      background: var(--cogs-bg-accent);

      td {
        padding: 8px 16px 8px 16px;
      }

      &.all-processes:hover {
        cursor: pointer;
      }
    }
  }
`;

export const Frame = styled.div`
  margin: 24px;
  width: 100vw;
`;

export const StyledDiv = styled.div`
  width: 65vw;
  background: #fafafa;
  border-radius: 12px;
  padding-bottom: 16px;
`;

export const StyledHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  box-shadow: inset 0px -1px 0px #e8e8e8;
  height: 72px;

  h1 {
    color: #333333;
    align-items: center;
    font-family: 'Inter';
    font-style: normal;
    font-weight: 600;
    font-size: 16px;
    line-height: 20px;
    letter-spacing: -0.01em;
    margin: 0 16px;
  }

  .segmented-control {
    margin-left: auto;
  }

  .new {
    margin: 0 16px 0 18px;
  }
`;

export const StyledBidMatrix = styled.div`
  overflow: auto;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  margin: 16px 16px 0 16px;

  .cogs-table {
    font-family: 'Inter';
    font-style: normal;
    font-size: 12px;
    line-height: 16px;

    th {
      color: #333333;
      background: #f5f5f5;
      font-weight: 500;
      letter-spacing: -0.004em;
      .cogs-th-container {
        justify-content: center;
      }
    }

    .cogs-table-row {
      color: #595959;
      background: #fafafa;
      font-weight: normal;
      letter-spacing: -0.008em;
      td {
        text-align: center;
        border-bottom: 0;
        border-top: 1px solid #e8e8e8;
      }
    }
  }
`;

export const TableContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  min-height: calc(100vh - 56px);
  height: calc(100vh - 56px);
  padding: 32px;

  .tableContainer {
    height: 100%;
  }
`;

export const SubProcess = styled.div`
  display: flex;
  justify-content: space-between;

  .cogs-tooltip__content {
    display: flex;
    align-items: center;
    margin-right: 4px;

    :not(:first-child) {
      margin-left: 8px;
    }
  }
`;

export const StatusIcon = styled(Icon)`
  border-radius: 5px;

  &.triggered {
    color: var(--cogs-border--status-undefined--muted);
    box-shadow: 0px 0px 0px 2px var(--cogs-border--status-undefined--strong)
      inset;
  }
  &.running {
    color: var(--cogs-bg-status-small--accent);
    box-shadow: 0px 0px 0px 2px var(--cogs-bg-status-small--accent) inset;
  }
  &.finished {
    color: var(--cogs-border--status-success--muted);
    box-shadow: 0px 0px 0px 2px var(--cogs-text-status-small--success) inset;
  }
  &.failed {
    color: var(--cogs-border--status-critical--muted);
    box-shadow: 0px 0px 0px 2px var(--cogs-text-status-small--danger) inset;
  }
`;
