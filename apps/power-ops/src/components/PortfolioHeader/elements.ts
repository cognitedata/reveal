import styled from 'styled-components/macro';
import { Title } from '@cognite/cogs.js';

export const StyledTitle = styled(Title)`
  font-family: 'Inter';
`;

export const Header = styled.span`
  display: flex;
  position: sticky;
  padding: 16px;
  text-align: left;
  align-items: center;
  background: var(--cogs-bg-default);
  border-bottom: 1px solid var(--cogs-bg-control--disabled);
  top: 56px;

  .cogs-label {
    margin: 4px 0 0 0;
  }

  Button {
    margin-left: auto;
  }
`;
