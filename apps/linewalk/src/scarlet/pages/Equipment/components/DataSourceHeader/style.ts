import styled, { css } from 'styled-components';
import { Icon as CogsIcon, IconProps } from '@cognite/cogs.js';

export const Container = styled.div`
  display: flex;
  margin-right: 8px;
  overflow: hidden;
  flex-grow: 1;
  align-items: center;
`;

export const IconContainer = styled.div`
  display: flex;
  flex-shrink: 0;
  padding-right: 16px;
  border-right: 1px solid var(--cogs-greyscale-grey4);
  margin-right: 16px;
`;

export const Label = styled.div`
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const Icon = styled(CogsIcon)<
  IconProps & { checkmark?: number; approved?: number }
>`
  ${({ checkmark }) =>
    checkmark &&
    css`
      color: var(--cogs-greyscale-grey4);
    `}

  ${({ approved }) =>
    approved &&
    css`
      color: var(--cogs-green-3);
    `}
`;
