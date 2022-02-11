import styled, { css } from 'styled-components';
import { Button as CogsButton } from '@cognite/cogs.js';
import z from 'utils/z';

export const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--cogs-midblue-7);
  padding: 5px 0;
  border-radius: 6px;
  margin-top: 18px;
}`;

export const Button = styled(CogsButton)`
  color: var(--cogs-midblue-2);
  padding: 8px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 6px;

  &:focus-visible {
    box-shadow: 0px 0px 0px 4px rgba(74, 103, 251, 0.7);
    outline: none;
  }
}`;

export const SelectedInfo = styled.div`
  color: var(--cogs-text-secondary);
  padding: 0 10px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

export const Component = styled.div<{ checked?: boolean }>`
  background-color: var(--cogs-white);
  width: 100%;
  display: flex;
  text-align: left;
  margin: 12px 0;

  label {
    display: flex;
    width: 100%;
    padding: 12px;
    border: 1px solid var(--cogs-border-default);
    border-radius: 6px;
    transition: border-color var(--cogs-transition-time-fast)
      var(--cogs-ease-in);
    cursor: pointer;

    &:hover {
      border-color: var(--cogs-state-checked-hover);
    }

    &:active {
      border-color: var(--cogs-state-checked-pressed);
    }
  }

  ${({ checked }) =>
    checked &&
    css`
      label {
        border-color: var(--cogs-state-base);

        &:hover {
          border-color: var(--cogs-state-unchecked-hover);
        }

        &:active {
          border-color: var(--cogs-state-unchecked-pressed);
        }
      }
    `}
`;

export const ComponentContent = styled.div`
  flex-grow: 1;
  overflow: hidden;
`;

export const ComponentName = styled.div`
  word-break: break-word;
`;

export const ComponentFields = styled.div`
  color: rgba(0, 0, 0, 0.45);
`;

export const ComponentListWrapper = styled.div`
  flex-grow: 1;
  position: relative;
  margin-bottom: 16px;

  &:before {
    content: '';
    display: block;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 1) 0%,
      rgba(255, 255, 255, 0) 100%
    );
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 12px;
    z-index: ${z.LIST_TOOL_OVERLAY};
  }

  &:after {
    content: '';
    display: block;
    background: linear-gradient(
      0deg,
      rgba(255, 255, 255, 1) 0%,
      rgba(255, 255, 255, 0) 100%
    );
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 12px;
    z-index: ${z.LIST_TOOL_OVERLAY};
  }
`;

export const ComponentList = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-x: hidden;
`;
