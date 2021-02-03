import styled from 'styled-components/macro';
import layers from 'utils/zindex';

export const SidebarContainer = styled.div<{ open: boolean }>`
  height: 100%;
  min-width: 298px;
  width: 298px;
  border-right: 1px solid var(--cogs-color-strokes-default);
  padding: 16px 24px;
  z-index: ${layers.LEFT_SIDEBAR};
  background: var(--cogs-white);
  transform: ${({ open }) => (open ? 'translateX(0)' : 'translateX(-286px)')};
  ${({ open }) => !open && 'position: fixed'};
  transition: all 0.3s ease-in-out;
`;

export const CollapseButton = styled.div<{ open: boolean }>`
  display: flex;
  cursor: pointer;
  padding: 12px;
  width: 40px;
  height: 40px;
  position: absolute;
  left: 278px;
  top: 112px;
  border-radius: 20px;
  background: var(--cogs-white);
  border-right: 1px solid var(--cogs-color-strokes-default);
  overflow: hidden;
  &:hover {
    ${({ open }) =>
      !open &&
      'border-radius: 0 20px 20px 0; width: 56px; padding-left: 28px;'};
    transition: all 0.3s ease-in-out;
  }
`;

export const TitleContainer = styled.div`
  margin-bottom: 16px;
`;

export const SuiteTitle = styled.span`
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
  padding: 4px;
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

export const AvailableSuitesContainer = styled.div`
  padding-bottom: 22px;
`;

export const LogoWrapper = styled.div`
  & img {
    padding-left: 36px;
    padding-bottom: 8px;
  }
`;

export const CogniteLogo = styled.div`
  padding: 0 24px;
  & .cogs-topbar--item {
    border-left: 0;
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
