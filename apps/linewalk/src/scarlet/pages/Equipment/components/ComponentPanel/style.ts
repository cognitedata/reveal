import styled, { css } from 'styled-components';
import { Button, Menu as CogsMenu } from '@cognite/cogs.js';
import z from 'utils/z';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
`;

export const Header = styled.div`
  flex-shrink: 0;
`;

export const TopBar = styled.div`
  color: var(--cogs-text-color-secondary);
  margin-top: 12px;
  display: flex;
  position: relative;
  z-index: ${z.LIST_TOOL_OVERLAY};
  align-items: center;
`;

export const TopBarContent = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-grow: 1;
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
    height: 8px;
  }
`;

export const Content = styled.div`
  position: absolute;
  top: 0;
  right: -18px;
  bottom: -18px;
  left: -18px;
  overflow-x: hidden;
  padding: 8px 18px 18px;
`;

export const MenuWrapper = styled.div`
  flex-shrink: 0;
  position: relative;
`;

export const MenuButton = styled(Button)`
  color: var(--cogs-black);
`;

export const Menu = styled(CogsMenu)`
  position: absolute;
  top: 100;
  right: 0;
`;

export const MenuItem = styled(CogsMenu.Item)<{ remove?: boolean }>`
  color: var(--cogs-text-primary);

  ${({ remove }) =>
    remove &&
    css`
      color: #af1613;
    `};
`;

export const LoaderContainer = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: ${z.OVERLAY};
`;

export const LoaderContent = styled.div`
  margin-top: 16px;
`;
