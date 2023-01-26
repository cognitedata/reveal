import { Icon } from '@cognite/cogs.js';
import styled from 'styled-components';

export const StyledSequenceTable = styled.table`
  text-align: left;
  font-family: 'Inter';
  display: flex;

  tr:first-child {
    border-top: none;
  }
  tr:last-child {
    border-bottom: none !important;
  }
  tbody {
    display: flex;
    flex-direction: column;
    flex: 1;

    tr {
      display: flex;
      align-items: center;

      th {
        color: var(--cogs-text-icon--medium);
        font-weight: 500;
        min-width: 100px;
        p {
          color: var(--cogs-text-icon--muted);
          font-weight: 400;
          line-height: 16px;
          font-size: var(--cogs-detail-font-size);
          margin: 0;
        }
      }
      td {
        min-width: 100px;
      }
    }
  }
`;

export const Main = styled.div`
  display: flex;
  flex-direction: column;
  overflow: auto;
  height: 100%;

  .main {
    padding: 8px 16px 0 16px;
  }
`;

export const StyledIcon = styled(Icon)`
  vertical-align: text-top;
  margin-right: 8px;
`;
