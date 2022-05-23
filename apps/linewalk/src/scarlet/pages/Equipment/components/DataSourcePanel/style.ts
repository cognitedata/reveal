import { Collapse as CogsCollapse } from '@cognite/cogs.js';
import styled, { keyframes } from 'styled-components';

export const Collapse = styled(CogsCollapse)`
  background-color: transparent;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

// fixes overflow issue when dropdown is in panel
const showCollapseContent = keyframes`{
  0% {overflow: hidden;}
  100% {overflow: visible;}
}`;

export const Panel = styled(CogsCollapse.Panel)`
  border: 1px solid var(--cogs-greyscale-grey4) !important;
  border-radius: 8px;
  overflow: hidden;
  background-color: none;

  &.rc-collapse-item-active {
    overflow: visible;
  }

  > .rc-collapse-header {
    flex-direction: row-reverse;
  }

  > .rc-collapse-content {
    border-top: 1px solid var(--cogs-greyscale-grey4) !important;
    padding: 0 12px;
  }

  > .rc-collapse-content-inactive {
    animation: ${showCollapseContent} 1s backwards;
  }
  > .rc-collapse-content-active {
    animation: ${showCollapseContent} 1s forwards;
  }
`;
