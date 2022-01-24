import { DataElementState } from 'scarlet/types';
import styled, { css } from 'styled-components';

const oneLineText = css`
  color: inherit;
  width: 100%;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;
export const Label = styled.div`
  ${oneLineText}
`;
export const Value = styled.div`
  ${oneLineText}
`;

export const Content = styled.div`
  flex-grow: 1;
  overflow: hidden;
`;

export const Actions = styled.div`
  flex-shrink: 0;
  margin: 0 -2px 0 6px;
  display: flex;
`;

export const Button = styled.button`
  width: 28px;
  height: 28px;
  background-color: var(--cogs-white);
  border-radius: 4px;
  margin: 0 2px;
  border-width: 1px;
  border-style: solid;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  outline: none;
  transition: all 0.2s;

  &:focus-visible {
    box-shadow: 0px 0px 0px 4px currentColor;
  }
}
`;

const buttonHoverStyles = css`
  &:hover:not([disabled]) {
    background-color: inherit;
    color: inherit;
    border-color: currentColor;
  }
`;

export const Container = styled.div<{
  hasValue: boolean;
  state: DataElementState;
}>`
  border-radius: 6px;
  border-width: 1px;
  border-style: solid;
  padding: 10px;
  margin: 8px;
  display: flex;

  ${({ hasValue, state }) => {
    if (state === DataElementState.APPROVED) {
      return css`
        background-color: var(--cogs-green-8);
        border-color: var(--cogs-green-3);
        color: var(--cogs-green-2);

        ${Button} {
          color: var(--cogs-green-5);
          border-color: var(--cogs-green-5);

          ${buttonHoverStyles}

          &[disabled] {
            border-color: var(--cogs-green-6);
            background-color: var(--cogs-green-6);
            cursor: inherit;
          }
        }
      `;
    }
    return hasValue
      ? css`
          background-color: var(--cogs-midorange-8);
          border-color: var(--cogs-midorange-4);
          color: var(--cogs-midorange-2);

          ${Button} {
            color: var(--cogs-midorange-4);
            border-color: var(--cogs-midorange-4);

            ${buttonHoverStyles}
          }
        `
      : css`
          background-color: var(--cogs-red-8);
          border-color: var(--cogs-red-4);
          color: var(--cogs-red-3);

          ${Value} {
            color: var(--cogs-red-2);
            opacity: 0.4;
          }

          ${Button} {
            color: var(--cogs-red-4);
            border-color: var(--cogs-red-4);

            ${buttonHoverStyles}
          }
        `;
  }}}
`;
