import { Collapse as DefaultCollapse, Icon } from '@cognite/cogs.js';
import styled from 'styled-components';

const { Panel: DefaultPanel } = DefaultCollapse;

export const Collapse = styled(DefaultCollapse)`
  background-color: white !important;
  flex: 1;
`;

export const Panel = styled(DefaultPanel)`
  /* Collapse in cogs.js isn't following cogs.js style (have to override temp.) */
  &:hover:not(.rc-collapse-item-active) {
    .rc-collapse-header h6 {
      transition: 250ms;
      color: var(--cogs-midblue-3);
    }
    .rc-collapse-header i {
      color: var(--cogs-midblue-3);
    }
  }
  &:hover.rc-collapse-item-active {
    .rc-collapse-header h6 {
      color: var(--cogs-greyscale-grey9);
    }
  }
  & > .rc-collapse-header {
    height: 52px;
    border-bottom: none !important;
    background: transparent !important;
    padding: 12px 16px !important;
    margin-top: 8px;
  }
  & > .rc-collapse-header > i {
    order: 1;
  }
  & > .rc-collapse-anim {
    overflow: hidden !important;
  }
  & > .rc-collapse-content-active {
    padding: 0 16px !important;
    overflow: visible;
    & > .rc-collapse-content-box {
      margin: 0;
      padding-bottom: 4px;
    }
  }
  border-top: 1px solid var(--cogs-border--muted) !important;
  margin: 10px 0;
  background-color: white;

  &:first-child {
    border-top: none !important;
  }
`;

export const Container = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  align-items: center;
  justify-content: space-between;
`;

export const StyledCollapseIcon = styled(Icon)`
  margin-right: 8px;
  color: var(--cogs-text-color-secondary);
  transition: transform 0.2s;
  width: 100%;
  transform: ${({ active }: { active: string }) =>
    JSON.parse(active) ? 'rotate(-180deg)' : 'rotate(0deg)'};
`;
