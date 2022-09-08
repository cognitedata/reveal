import styled from 'styled-components/macro';
import { Collapse, Flex } from '@cognite/cogs.js';

export const StyledTable = styled.table`
  width: 100%;
  text-align: left;
  font-family: 'Inter';
  overflow: hidden;
  margin-bottom: 12px;

  thead {
    tr {
      border-top: none;

      th {
        padding: 12px 16px;
        color: var(--cogs-text-icon--medium);
      }
    }
  }

  tbody {
    tr {
      color: var(--cogs-text-secondary);
      border-top: 1px solid var(--cogs-bg-control--disabled);

      td {
        padding: 8px 16px;
        color: var(--cogs-text-icon--strong);
      }
    }
  }
`;

export const TableContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: calc(100vh - 56px);
  height: calc(100vh - 56px);
  padding: 24px 16px;
  width: 100vw;

  .tableContainer {
    height: 100%;
    width: 100%;
  }
`;

export const Container = styled.div`
  padding: 16px;

  .eventsTable {
    display: flex;
    justify-content: center;
    width: 100%;

    .tableContainer {
      width: 100%;
    }
  }
`;

export const FlexContainer = styled(Flex)`
  font-family: 'Inter';
  flex-direction: column;
  gap: 20px;
  border-bottom: 1px solid var(--cogs-border-default);
  padding: 16px 64px;
  background-color: var(--cogs-surface--medium);

  .external-id {
    .cogs-body-2 {
      margin-bottom: 6px;
    }

    .input-wrapper {
      width: 100%;

      .cogs-input {
        cursor: default;
        width: 100%;
        border: none;
        color: var(--cogs-text-icon--muted);

        &.cogs-input-default:disabled {
          background: var(--cogs-surface--interactive--disabled--alt);
          &:hover {
            border: none;
          }
        }
      }
    }

    .cogs-btn {
      border-radius: 0 6px 6px 0;
      &:not(:hover) {
        background: var(--cogs-surface--interactive--disabled--alt);
      }
    }
  }
`;

export const MetadataContainer = styled(Flex)`
  flex-wrap: wrap;
  gap: 20px;

  .cogs-body-2 {
    margin-bottom: 4px;
    width: 30vw;
    overflow-wrap: anywhere;
  }
`;

export const CollapseContainer = styled(Collapse)`
  font-family: 'Inter';
  margin-bottom: 16px;
  background-color: var(--cogs-surface--medium);
  border-radius: 8px;

  .cogs-body-2 {
    margin: 0;
  }

  .cogs-icon {
    margin-left: auto;
    transition: transform 0.2s;
  }

  .rc-collapse-item:last-child > .rc-collapse-content {
    border-radius: 0 0 8px 8px;
    border-collapse: separate;
    background: var(--cogs-surface--medium);
    border-top: 1px solid var(--cogs-border-default);
  }
`;

export const Header = styled.span`
  display: flex;
  align-items: center;
  height: 68px;
  border-bottom: 1px solid var(--cogs-border-default);
  padding: 12px;
  background-color: var(--cogs-surface--medium);

  div {
    display: flex;
    flex-direction: column;
    padding-left: 16px;

    .cogs-detail {
      color: var(--cogs-text-icon--muted);
    }
  }

  .cogs-label {
    margin-left: auto;
  }
`;
