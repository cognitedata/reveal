import { Collapse as CogsCollapse } from '@cognite/cogs.js';
import styled from 'styled-components';

export const Collapse = styled(CogsCollapse)`
  background-color: transparent;
`;

export const Panel = styled(CogsCollapse.Panel)`
  border: 1px solid var(--cogs-greyscale-grey4) !important;
  overflow: hidden;
  border-radius: 8px;
  margin: 12px 0;

  > .rc-collapse-header {
    flex-direction: row-reverse;
    background-color: var(--cogs-white);
  }

  > .rc-collapse-content {
    border-top: 1px solid var(--cogs-greyscale-grey4) !important;
    padding: 0 12px;
  }
`;

export const EmptySource = styled.div`
  background-color: var(--cogs-greyscale-grey2);
  border: 1px solid var(--cogs-greyscale-grey4) !important;
  overflow: hidden;
  border-radius: 8px;
  margin: 12px 0;
  padding: 10px 16px;
  display: flex;
`;

export const EmptySourceHead = styled.div`
  flex-grow: 1;
`;

export const EmptySourceBody = styled.div`
  color: var(--cogs-greyscale-grey5);
  flex-shrink: 0;
`;
