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
  overflow: hidden;
  border-radius: 8px;

  > .rc-collapse-header {
    flex-direction: row-reverse;
    background-color: var(--cogs-white);
  }

  > .rc-collapse-content {
    border-top: 1px solid var(--cogs-greyscale-grey4) !important;
    padding: 0 12px;
  }
`;
