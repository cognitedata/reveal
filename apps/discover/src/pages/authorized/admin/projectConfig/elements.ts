import styled from 'styled-components/macro';

import { Flex, Icon } from '@cognite/cogs.js';

import { sizes } from 'styles/layout';

export const FullContainer = styled(Flex)`
  height: 100%;
  width: 100%;
`;

export const ConfigIcon = styled(Icon)`
  margin-right: 8px;
  color: var(--cogs-text-color-secondary);
  transition: transform 0.2s;
  transform: ${({ active }: { active: string }) =>
    JSON.parse(active) ? 'rotate(-180deg)' : 'rotate(0deg)'};
`;

export const CollapseWrapper = styled(Flex)`
  & > .config-field-item {
    display: flex;
    flex-direction: column;
    gap: ${sizes.normal};
  }
  & > .rc-collapse {
    background-color: var(--cogs-greyscale-grey1);
  }
  & > .cogs-collapse > .rc-collapse-item > .rc-collapse-header {
    padding: 14px 12px;
    border-bottom: none;
    border-radius: 8px;
    background-color: var(--cogs-greyscale-grey1);
    &:hover {
      background-color: var(--cogs-bg-control--toggled-hover);
    }
    &.config-item-active {
      background-color: var(--cogs-bg-control--toggled);
    }
  }
  & > .cogs-collapse > .rc-collapse-item > .rc-collapse-content {
    & > .rc-collapse-content-box {
      margin-bottom: 0;
    }
    background-color: var(--cogs-greyscale-grey1);
    padding: 0 0 0 12px;
    margin: 0 0 16px 19px;
    border-left: 1px solid var(--cogs-color-strokes-default);
  }
  & > .cogs-collapse > .rc-collapse-item {
    border-top: none;
  }
`;

export const LeafField = styled(Flex)`
  align-items: center;
  cursor: pointer;
  padding: 14px 12px;
  border-radius: 8px;
  background-color: var(--cogs-greyscale-grey1);
  &:hover {
    background-color: var(--cogs-bg-control--toggled-hover);
  }
  &.config-item-active {
    background-color: var(--cogs-bg-control--toggled);
  }
`;
