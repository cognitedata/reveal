import styled from 'styled-components/macro';
import { Button, Title } from '@cognite/cogs.js';

export const StyledTitle = styled(Title)`
  font-family: 'Inter';
`;

export const Header = styled.span`
  display: flex;
  position: static;
  padding: 16px;
  text-align: left;
  align-items: center;
  background: var(--cogs-bg-default);
  border-bottom: 1px solid var(--cogs-bg-control--disabled);
  top: 56px;

  .cogs-label {
    margin: 4px 0 0 0;
  }

  .right-side {
    display: flex;
    align-items: center;
    margin-left: auto;
  }
`;

export const VerticalSeparator = styled.div`
  background: var(--cogs-border--muted);
  width: 1px;
  height: 16px;
  margin: 0 16px 0 16px;
`;

export const MethodItem = styled.div`
  display: flex;
  text-align: left;
  font-family: 'Inter';
  font-weight: 500;

  &::not(.selected) {
    color: var(--cogs-text-icon--medium);
  }

  p {
    color: var(--cogs-text-icon--muted);
    margin: 0;
    font-weight: 400;
  }

  .cogs-icon {
    margin: 0 0 0 8px;
    align-items: flex-start;
  }
`;

export const MethodButton = styled(Button)`
  width: 248px;
  justify-content: left;

  .method-name {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .cogs-icon {
    margin-left: auto;
  }
`;
