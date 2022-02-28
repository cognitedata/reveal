import { Menu } from '@cognite/cogs.js';
import styled from 'styled-components/macro';
import layers from 'utils/zindex';

export const SidebarContainer = styled.div<{ open: boolean }>`
  height: 100%;
  min-width: 298px;
  width: 298px;
  border-right: 1px solid var(--cogs-color-strokes-default);
  padding: 20px 24px;
  z-index: ${layers.LEFT_SIDEBAR};
  background: var(--cogs-white);
  position: relative;
  margin-left: ${({ open }) => (open ? '0px' : '-242px')};
  ${({ open }) => !open && 'padding: 16px 4px'};
  &:hover .collapse-button {
    opacity: 1;
  }
  .nav-item {
    ${({ open }) => !open && 'justify-content: flex-end'};
  }
  .nav-item-text {
    ${({ open }) => !open && 'display: none'};
  }
`;

export const CollapseButton = styled.div<{ open: boolean }>`
  opacity: ${({ open }) => (open ? '0' : '1')};
  display: flex;
  cursor: pointer;
  width: 32px;
  height: 32px;
  position: absolute;
  right: 0;
  bottom: 12px;
  justify-content: center;
  align-items: center;
  transform: translateX(50%);
  color: var(--cogs-primary);
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.08), 0px 1px 2px rgba(0, 0, 0, 0.08),
    0px 1px 4px rgba(0, 0, 0, 0.06);
  border-radius: 20px;
  background: var(--cogs-white);
  border-right: 1px solid var(--cogs-color-strokes-default);
  overflow: hidden;
  transition: all 0.2s;
  &:hover {
    background: var(--cogs-primary);
    color: white;
  }
  .cogs-icon {
    width: 12px;
  }
`;

export const TitleContainer = styled.div`
  margin-bottom: 16px;
`;

export const NavigationItemTitle = styled.span`
  color: ${(props: { disabled?: boolean }) =>
    props.disabled ? 'var(--cogs-greyscale-grey6)' : 'var(--cogs-black)'};
  margin-left: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const NavigationItemContainer = styled.div<{ selected?: boolean }>`
  display: flex;
  align-items: center;
  padding: 6px 0;
  background-color: ${({ selected }) =>
    selected ? 'var(--cogs-midblue-8)' : 'var(--cogs-white)'};

  &:hover {
    cursor: pointer;
    background-color: var(--cogs-midblue-8);
    border-radius: 4px;
  }
  & > span {
    display: grid;
  }
`;

export const ItemsContainer = styled.div`
  padding-bottom: 22px;
`;

export const LogoWrapper = styled.div`
  & img {
    padding-top: 3px;
    padding-left: 36px;
    padding-bottom: 8px;
  }

  .cogs-topbar--item__logo {
    border-left: none;
  }
`;

export const CogniteLogo = styled.div`
  padding: 0 24px;
  & .cogs-topbar--item {
    border-left: 0;
  }
`;

export const AppHeaderWrapper = styled.div`
  .topbar-logo-wrapper {
    border-left: none;
  }
  .app-header-groups-list-menu {
    max-height: calc(100vh - 65px);
    overflow-y: scroll;
  }

  .topbar-left > span {
    flex-grow: 1;
    max-width: 550px;
  }

  .topbar-search {
    flex-grow: 1;

    input.cogs-input {
      flex-grow: 1;
    }
  }
`;

export const GroupPreview = styled.div`
  background-color: var(--cogs-greyscale-grey8);
  color: var(--cogs-white);
  height: 56px;
  & .cogs-icon-Public {
    height: 22px;
  }
  & .cogs-btn {
    color: var(--cogs-white);
  }
  & .cogs-topbar [class*='cogs-topbar--item'] {
    border-left: none;
  }
  .cogs-topbar .cogs-topbar--item__action:hover {
    background-color: var(--cogs-greyscale-grey6);
  }
`;

export const GroupItemWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .cogs-menu-item {
    &:hover {
      background: rgba(74, 103, 251, 0.05);
    }

    &.selected {
      color: inherit;
      background: rgba(74, 103, 251, 0.1);
    }
  }
`;

export const MenuItemWrapper = styled(Menu)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .cogs-menu-item {
    &:hover {
      background: rgba(74, 103, 251, 0.05);
    }
  }
`;

export const SuiteBreadcrumbContainer = styled.div`
  display: contents;
  & .cogs-title-5 {
    font-feature-settings: unset;
    padding-left: 8px;
  }
`;

export const SuiteBreadcrumbMenu = styled.div`
  padding: 15px 10px 10px;
  cursor: pointer;
`;

export const SuiteBreadcrumbMenuItem = styled.div`
  & .cogs-title-6 {
    display: flex;
  }
  & .cogs-title-6 > i {
    display: flex;
  }
`;
