import { Checkbox as CogsCheckbox } from '@cognite/cogs.js';
import { DataElementState } from 'scarlet/types';
import styled, { css } from 'styled-components';

const oneLineText = css`
  width: 100%;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;
export const Label = styled.div`
  color: inherit;
  ${oneLineText}
`;

export const DataContainer = styled.div<{ isLink?: boolean }>`
  display: flex;
  gap: 4px;
  align-items: center;

  ${({ isLink }) =>
    isLink &&
    css`
      cursor: pointer;
      transition: opacity var(--cogs-transition-time-fast);
      &:hover {
        opacity: 0.8;
      }
    `}
`;

export const Value = styled.div<{ noValue?: boolean }>`
  color: inherit;

  ${({ noValue }) =>
    noValue
      ? css`
          opacity: 0.5;
        `
      : oneLineText}
`;

export const DataSource = styled.div<{ isDiscrepancy: boolean }>`
  display: flex;
  color: var(--cogs-midorange-5);
  background-color: var(--cogs-white);
  border: 1px solid currentColor;
  border-radius: 4px;
  padding: 0 4px;
  align-items: center;
  gap: 2px;

  ${({ isDiscrepancy }) =>
    isDiscrepancy &&
    css`
      background-color: var(--cogs-red-4);
      color: var(--cogs-white);
    `}
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
  state: DataElementState;
}>`
  border-radius: 6px;
  border-width: 1px;
  border-style: solid;
  padding: 10px;
  margin: 8px 0;
  display: flex;
  align-items: center;

  ${({ state }) => {
    switch (state) {
      case DataElementState.APPROVED:
        return css`
          background-color: var(--cogs-green-8);
          border-color: var(--cogs-green-3);
          color: var(--cogs-green-2);

          ${Button} {
            color: var(--cogs-green-5);
            border-color: currentColor;

            ${buttonHoverStyles}
          }

          ${DataSource} {
            color: var(--cogs-green-5);
          }
        `;

      case DataElementState.OMITTED:
        return css`
          background-color: var(--cogs-greyscale-grey1);
          border-color: var(--cogs-greyscale-grey3);
          color: var(--cogs-greyscale-grey6);

          ${Button} {
            color: var(--cogs-greyscale-grey5);
            border-color: currentColor;

            ${buttonHoverStyles}
          }

          ${DataSource} {
            color: var(--cogs-greyscale-grey5);
          }
        `;
    }

    return css`
      background-color: var(--cogs-midorange-8);
      border-color: var(--cogs-midorange-6);
      color: var(--cogs-midorange-2);

      ${Button} {
        color: var(--cogs-midorange-4);
        border-color: var(--cogs-midorange-4);

        ${buttonHoverStyles}
      }
    `;
  }}}
`;

export const CheckboxContainer = styled.div`
  flex-shrink: 0;
`;

export const Checkbox = styled(CogsCheckbox)`
  .cogs-checkbox input[type='checkbox']:not(:checked) + & {
    border-color: var(--cogs-state-base);
    background: transparent;
  }

  .cogs-checkbox input[type='checkbox']:not(:checked):disabled + & {
    border-color: var(--cogs-state-base);
    background: transparent;
    color: transparent;
    opacity: 0.3;
  }

  .cogs-checkbox input[type='checkbox']:checked:disabled + & {
    border-color: var(--cogs-state-base);
    background: var(--cogs-state-base);
    color: var(--cogs-white);
    opacity: 0.3;
  }
`;
