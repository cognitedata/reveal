import { Icon, Input, Title } from '@cognite/cogs.js';
import styled from 'styled-components';

export const StampToolPopUpWrapper = styled.div`
  position: fixed;
  height: 619px;
  overflow-y: scroll;
  margin-left: 37px;
  bottom: 16px;
  z-index: ${99};
  padding: 13px 16px;
  box-shadow: 0px 8px 16px 4px rgba(0, 0, 0, 0.04),
    0px 2px 12px rgba(0, 0, 0, 0.08);
  background-color: white;
  border-radius: 4px;

  .workspace-collapse {
    background-color: white;
    width: 250px;
  }

  .workspace-stamp-header {
    margin-bottom: 28px;
  }

  .workspace-stamp-collapse {
    background-color: white;
    margin-bottom: 14px;
    padding: 0;
    border: 0;

    .workspace-stamp-collapse_header {
      padding: 0;
      display: flex;
      justify-content: space-between;
      flex-direction: row-reverse;
    }

    //TODO: Should probably find a better way for targeting this.
    .rc-collapse-content {
      padding: 0;
    }
  }
`;

export const StampToolHeaderTitle = styled(Title)`
  margin-bottom: 28px;
  color: var(--cogs-text-hint);
`;

export const StampToolSearchInput = styled(Input)`
  &.cogs-input-container {
    margin-bottom: 20px;
  }
`;

export const CollapseHeaderWrapper = styled.span`
  display: flex;
  .count-label {
    margin-left: 4px;
  }
`;

export const StampToolCollapseIcon = styled(Icon)<{ $isActive: boolean }>`
  margin-right: 8;
  transition: transform 0.2s;
  transform: ${({ $isActive }) => ($isActive ? 'rotate(180deg)' : 'none')};
`;

export const StampGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
`;

export const StampToolItem = styled.div`
  width: 72px;
  height: 72px;
  display: flex;
  cursor: pointer;
  background-color: var(--cogs-bg-control--secondary);
  border-radius: 8px;
  img {
    margin: auto;
    max-width: 52px;
    max-height: 52px;
  }

  &:hover {
    background-color: var(--cogs-bg-control--secondary-hover);
  }

  &.active {
    background-color: var(--cogs-bg-control--secondary-pressed);
  }
`;

export const StampToolNoResultWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 5px;
  p {
    color: var(--cogs-greyscale-grey6);
    font-weight: 600;
    margin-top: 15px;
    word-break: break-word;
    text-align: center;
  }
`;
