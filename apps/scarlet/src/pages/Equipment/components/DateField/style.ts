import styled, { css } from 'styled-components';
import z from 'utils/z';

export const Label = styled.label`
  display: block;
  color: rgba(0, 0, 0, 0.45);
  margin-bottom: 6px;
`;

export const DateContainer = styled.div<{ disabled?: boolean }>`
  display: flex;
  border: 1px solid var(--cogs-border-default);
  border-radius: 5px;

  ${({ disabled }) =>
    disabled &&
    css`
      border-color: var(--cogs-greyscale-grey5);
      background: var(--cogs-greyscale-grey3);
    `}
`;

export const InputContainer = styled.div`
  position: relative;
  height: 46px;
  width: 100%;

  &:nth-child(1) {
    border-radius: 5px 0 0 5px;
  }

  &:nth-child(2) {
    &:after,
    &:before {
      content: '';
      display: block;
      height: 28px;
      width: 1px;
      background-color: var(--cogs-border-default);
      top: 50%;
      position: absolute;
      transform: translateY(-50%);
      right: 0;
      z-index: ${z.MINIMUM};
    }
    &:before {
      left: 0;
    }
    input {
      left: 1px;
      right: 1px;
    }
  }

  &:nth-child(3) {
    border-radius: 0 5px 5px 0;
  }

  > input {
    border-right: 0;
    text-align: center;
    position: relative;
    border: none;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    border-radius: inherit;
    background: none;
    z-index: ${z.DEFAULT};

    &:not([disabled]):hover {
      outline: var(--cogs-input-hover-border);
    }

    &:not([disabled]):focus {
      outline: var(--cogs-input-hover-border);
      box-shadow: 0 0 0 1px var(--cogs-midblue-4) inset;
    }

    &::placeholder {
      color: var(--cogs-greyscale-grey6);
    }
  }
`;
