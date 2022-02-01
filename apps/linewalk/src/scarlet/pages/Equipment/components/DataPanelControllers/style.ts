import { Button } from '@cognite/cogs.js';
import styled, { css } from 'styled-components';
import z from 'utils/z';

export const Container = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  overflow-y: hidden;
  width: 60px;
`;

export const ToggleButton = styled(Button)`
  position: absolute;
  right: 18px;
  top: 18px;
  z-index: ${z.MINIMUM};
`;

export const TabList = styled.div`
  display: flex;
  position: absolute;
  top: 50%;
  right: 0;
  transform: translate(100%, 0) rotate(-90deg) translate(-50%, -100%);
  transform-origin: 0 0;
`;

export const TabItem = styled.button`
  border-radius: 4px 4px 0 0;
  min-width: 200px;
  overflow: hidden;
  padding: 12px 12px 8px;
  text-align: center;
  box-shadow: -4px 0px 14px rgba(0, 0, 0, 0.17);
  position: relative;
  outline: none;
  border: 0;
  background: none;
  color: var(--cogs-greyscale-grey9);

  &.focus-visible {
    box-shadow: 0px 0px 0px 4px rgba(74, 103, 251, 0.7);
    z-index: ${z.DEFAULT};
  }

  &:before {
    content: '';
    display: block;
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0px;
    top: 0px;
    background-color: var(--cogs-white);
    transform: skewX(15deg);
    transform-origin: right bottom;
    box-shadow: 0 0px 14px rgba(0, 0, 0, 0.17);
    z-index: ${z.MINIMUM};
    border: 0;
    border-radius: 0;
    cursor: pointer;
  }

  ${({ disabled }) =>
    !disabled &&
    css`
      box-shadow: none;
      color: rgba(0, 0, 0, 0.45);

      &:before {
        box-shadow: none;
        background-color: var(--cogs-greyscale-grey2);
      }
    `}
`;

export const TabItemContent = styled.span`
  letter-spacing: 0.14px;
  margin: 0 auto;
  text-transform: uppercase;
  box-shadow: none;
  font-weight: 600;
  position: relative;
  z-index: ${z.MINIMUM};
  cursor: pointer;
  border-radius: 4px;
  padding: 4px;
  pointer-events: none;
`;

export const TabItemBG = styled.span`
  display: block;
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0px;
  top: 0px;
  background-color: var(--cogs-white);
  transform: skewX(15deg);
  transform-origin: right bottom;
  box-shadow: 0 0px 14px rgba(0, 0, 0, 0.17);
  z-index: ${z.MINIMUM};
  border: 0;
  border-radius: 0;

  &:hover {
    box-shadow: 0 0px 14px rgba(0, 0, 0, 0.17);
  }

  [disabled] > & {
    box-shadow: none;
  }
`;
