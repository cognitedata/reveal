import { Collapse as CogsCollapse } from '@cognite/cogs.js';
import styled from 'styled-components';

export const Collapse = styled(CogsCollapse)`
  background-color: transparent;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

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
    overflow: visible;
  }
`;
