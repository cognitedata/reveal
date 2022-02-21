import { Collapse as CogsCollapse } from '@cognite/cogs.js';
import styled from 'styled-components';

export const Collapse = styled(CogsCollapse)`
  background-color: transparent;
`;

export const Panel = styled(CogsCollapse.Panel)`
  border: 1px solid var(--cogs-midblue-3) !important;
  overflow: hidden;
  border-radius: 8px;
  margin: 12px 0;

  > .rc-collapse-header {
    background-color: var(--cogs-white);
    color: var(--cogs-midblue-3) !important;
    transition: color 0.2s;
  }

  > .rc-collapse-content {
    border-top: 1px solid var(--cogs-greyscale-grey4) !important;
    padding: 0 12px;
  }

  &.rc-collapse-item-active {
    border: 1px solid var(--cogs-greyscale-grey4) !important;
  }

  &.rc-collapse-item-active > .rc-collapse-header {
    color: inherit !important;
  }
`;

export const Header = styled.div`
  color: inherit;
`;

export const InfoBox = styled.div`
  background-color: var(--cogs-greyscale-grey1);
  padding: 24px 20px;
`;

export const InfoBoxInnerContent = styled.div`
  width: 160px;
  margin: 0 auto;
  text-align: center;

  > .cogs-micro {
    color: var(--cogs-text-color-secondary);
  }
`;
