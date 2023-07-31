import { Button } from '@cognite/cogs.js';
import styled, { css } from 'styled-components';

export const Container = styled.div`
  flex-shrink: 0;
  width: 18vw;
  min-width: 250px;
  border-right: 1px solid var(--cogs-greyscale-grey4);
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const Plants = styled.div`
  margin-top: 8px;
  font-size: 20px;
  line-height: 28px;
  font-weight: 600;
  display: flex;
  gap: 8px;
  align-items: center;
`;

export const Plant = styled.div`
  margin-top: 8px;
  > .cogs-micro {
    color: rgba(0, 0, 0, 0.45);
    text-transform: uppercase;
    font-weight: 600;
  }
`;

export const SearchContainer = styled.div`
  margin-top: 24px;
`;

export const TopBar = styled.div`
  display: flex;
  margin: 20px -8px 0 0;
  justify-content: space-between;
  align-items: center;
  color: rgba(0, 0, 0, 0.65);

  > .cogs-body-2 {
    color: inherit;
  }
`;

export const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const ListItem = styled.button<{ active?: boolean; disabled?: boolean }>`
  background-color: var(--cogs-greyscale-grey1);
  border-radius: 6px;
  color: var(--cogs-text-secondary);
  appearance: none;
  border: 2px solid transparent;
  display: flex;
  align-items: center;
  height: auto;
  text-align: left;
  font-weight: 400;
  gap: 8px;
  padding: 16px;

  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  transition: all var(--cogs-transition-time-fast);

  ${({ active }) =>
    active &&
    css`
      border-color: #6e85fc;
      background-color: #eef0fd;
      color: #4255bb;
    `}

  &:not([disabled]):hover {
    background-color: #eef0fd;
    color: #4255bb;
    outline: none;
  }

  &:focus-visible {
    box-shadow: 0px 0px 0px 4px rgb(74 103 251 / 70%);
    outline: none;
  }
`;

export const ListItemContent = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 2px;

  > .cogs-title-4,
  > .cogs-body-2 {
    color: inherit;
  }
`;

export const NumberEquipments = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

export const BackButtonContainer = styled.div`
  margin: -16px -16px 0;

  &:after {
    content: '';
    display: block;
    border-bottom: 1px solid #d9d9d9;
    margin: 0 16px 16px;
  }
`;

export const BackButton = styled(Button)`
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;
  padding: 16px !important;
  height: auto;
  justify-content: flex-start;
`;

export const ContentWrapper = styled.div`
  flex-grow: 1;
  position: relative;

  &:after {
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
    height: 16px;
  }
`;

export const ScrollContainer = styled.div`
  position: absolute;
  top: 0;
  right: -16px;
  bottom: -16px;
  left: -16px;
  overflow-x: hidden;
  padding: 16px 16px 16px;
`;
