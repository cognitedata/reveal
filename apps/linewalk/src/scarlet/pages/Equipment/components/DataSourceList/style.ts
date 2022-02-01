import { Collapse as CogsCollapse } from '@cognite/cogs.js';
import styled from 'styled-components';

export const Header = styled.div`
  display: flex;
  align-content: center;
  padding: 12px 0;

  > span {
    flex-grow: 1;
    padding-left: 4px;
  }
`;

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
