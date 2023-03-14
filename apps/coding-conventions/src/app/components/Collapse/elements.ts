import { Collapse as DefaultCollapse, Icon } from '@cognite/cogs.js';
import styled from 'styled-components';

const { Panel: DefaultPanel } = DefaultCollapse;

export const Collapse = styled(DefaultCollapse)`
  background-color: white !important;
  flex: 1;
`;

export const Panel = styled(DefaultPanel)<{ $color: string }>`
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

  &.rc-collapse-item-active {
    .rc-collapse-header {
      border-bottom: 1px solid ${(props) => props.$color} !important;
    }
  }

  & > .rc-collapse-header {
    height: 52px;
    border-bottom: none !important;
    background: transparent !important;
    padding: 12px 16px !important;
    /* cursor: default !important; */
  }
  & > .rc-collapse-header > i {
    order: 1;
  }
  & > .rc-collapse-anim {
    overflow: hidden !important;
  }
  & > .rc-collapse-content-active {
    padding: 16px 16px !important;
    border-radius: 8px !important;
    overflow: visible;
    padding-bottom: 12px !important;
    cursor: default !important;
    & > .rc-collapse-content-box {
      margin: 0;
      padding-bottom: 4px;
    }
  }
  cursor: pointer !important;
  /* border-top: 1px solid var(--cogs-border--muted) !important; */
  border: 2px solid ${(props) => props.$color} !important;
  border-radius: 8px;
  margin: 10px 0;
  background-color: white;
`;

export const Container = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  align-items: center;
  justify-content: space-between;
`;

export const StyledCollapseIcon = styled(Icon)`
  color: var(--cogs-text-color-secondary);
  transition: transform 0.2s;
  width: 100%;
  transform: ${({ active }: { active: string }) =>
    JSON.parse(active) ? 'rotate(-180deg)' : 'rotate(0deg)'};
`;

export const StyledTrashIcon = styled(Icon)`
  color: var(--cogs-decorative--red--600);
  &:hover {
    color: var(--cogs-decorative--red--700) !important;
  }
`;
