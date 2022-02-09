import styled from 'styled-components';
import { Collapse as CogsCollapse } from '@cognite/cogs.js';

export const Container = styled.div`
  margin: -12px 0;
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

export const PanelHeader = styled.div`
  flex-grow: 1;
`;
