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
      flex-grow: 0;
      margin-left: auto;
    `}
`;

export const Delimiter = styled.div`
  border-bottom: 1px solid var(--cogs-greyscale-grey4);
  margin: 16px 0;
`;

export const LoaderContainer = styled.div`
  margin-left: 12px;
  line-height: 0;
  display: inline-block;
  vertical-align: middle;
`;

export const ExternalSourceContainer = styled.div`
  margin-bottom: 8px;
`;

export const PrimaryValueContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const PrimaryValueLabel = styled.div`
  color: rgba(0, 0, 0, 0.45);
  margin-bottom: 4px;
`;
