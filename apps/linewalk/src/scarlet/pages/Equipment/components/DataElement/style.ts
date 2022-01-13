import styled, { css } from 'styled-components';

export const Container = styled.div<{ hasValue: boolean }>`
  background-color: rgba(244, 113, 139, 0.1);
  border: 1px solid #f4718b;
  color: #d51a46;
  border-radius: 6px;
  padding: 10px;
  margin: 8px;

  ${({ hasValue }) =>
    hasValue &&
    css`
      background-color: var(--cogs-midorange-8);
      border-color: var(--cogs-midorange-4);
      color: var(--cogs-midorange-2);
    `}
`;

export const Label = styled.div`
  color: inherit;
`;
export const Value = styled.div<{ hasValue: boolean }>`
  color: inherit;

  ${({ hasValue }) =>
    !hasValue &&
    css`
      opacity: 0.4;
    `}
`;
