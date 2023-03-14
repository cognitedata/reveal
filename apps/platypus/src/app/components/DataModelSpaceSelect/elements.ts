import styled from 'styled-components/macro';
import { Detail, Icon } from '@cognite/cogs.js';

export const InputDetail = styled.div`
  display: flex;
  align-items: center;
  margin: 4px 0 0;

  .cogs-icon-Warning {
    margin-right: 6px;
  }
`;

export const HorizontalDivider = styled.div`
  height: 1px;
  background: var(--cogs-border--interactive--default--alt);
  margin: 32px 0 16px;
`;

export const StyledLink = styled.a`
  color: var(--cogs-text-icon--on-contrast--strong);
  text-decoration: underline;

  &:hover {
    color: var(--cogs-text-icon--on-contrast--strong);
  }
`;

export const StyledIcon = styled(Icon)`
  color: var(--cogs-text-icon--muted);
  transform: translateY(2px);
`;

export const StyledDetail = styled(Detail)`
  color: var(--cogs-text-icon--medium);
`;
