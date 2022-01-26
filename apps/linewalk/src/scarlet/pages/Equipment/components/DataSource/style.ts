import styled, { css } from 'styled-components';
import { Button as CogsButton } from '@cognite/cogs.js';

export const ButtonContainer = styled.div`
  display: flex;
  margin: 20px -6px 0;
`;

export const Button = styled(CogsButton)`
  margin: 0 6px;
  flex-grow: 1;
  flex-shrink: 0;

  ${({ type }) =>
    type === 'tertiary' &&
    css`
      color: var(--cogs-red-2);
      border-color: currentColor;
    `}
`;
