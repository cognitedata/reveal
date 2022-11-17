import styled from 'styled-components/macro';

export const StyledTable = styled.table`
  width: 100%;
  text-align: left;
  font-family: 'Inter';
  overflow: hidden;
  margin-bottom: 12px;

  thead {
    tr {
      border-top: none;
      height: 48px;

      th {
        padding: 12px 16px;
        color: var(--cogs-text-icon--medium);
        span {
          display: flex;
          align-items: center;

          .cogs-icon {
            margin-left: 4px;
          }
        }
      }
    }
  }

  tbody {
    tr {
      height: 48px;
      color: var(--cogs-text-secondary);
      border-top: 1px solid var(--cogs-bg-control--disabled);

      td {
        padding: 8px 16px;
        color: var(--cogs-text-icon--medium);
      }
    }
  }
`;
