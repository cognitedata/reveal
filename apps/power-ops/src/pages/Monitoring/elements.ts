import styled from 'styled-components/macro';
import { BaseContainer } from 'styles/layout';

export const Container = styled(BaseContainer)`
  padding-top: 32px;
  padding-bottom: 32px;
`;

export const StyledTable = styled.table`
  text-align: left;
  border-radius: 8px;
  overflow: hidden;
  font-family: 'Inter';

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
    }
  }
`;
