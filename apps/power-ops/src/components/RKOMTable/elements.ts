import styled from 'styled-components/macro';
import { MainPanel } from 'styles/layout';

export const StyledSequenceTable = styled.table`
  text-align: left;
  font-family: 'Inter';
  display: flex;

  tr:first-child {
    border-top: none;
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

export const Main = styled(MainPanel)`
  flex-direction: column;
  overflow: auto;

  .main {
    padding: 8px 16px 0 16px;
  }
`;
