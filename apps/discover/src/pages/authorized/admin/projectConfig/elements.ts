import styled from 'styled-components/macro';

import { Flex, Icon, Body } from '@cognite/cogs.js';

import { sizes } from 'styles/layout';

export const ProjectConfigSidebar = styled(Flex)`
  width: 352px;
  height: 100%;
  border-right: 1px solid var(--cogs-color-strokes-default);
`;

export const FullContainer = styled(Flex)`
  height: 100%;
  width: 100%;
`;

export const RightPanelContainer = styled(FullContainer)`
  flex: 1 1 0;
`;

export const FormContainer = styled(FullContainer)`
  height: 100%;
  flex: 1 1 0;
  padding: 16px;
  overflow: auto;
  .config-textarea-container {
    display: flex;
    flex-direction: column;
  }
`;

export const ProjectConfigFooter = styled(Flex)`
  padding: 24px 16px;
  background-color: var(--cogs-greyscale-grey1);
`;

export const PaddingBottomBorder = styled.div`
  border-bottom: 1px solid var(--cogs-color-strokes-default);
  padding: ${sizes.normal};
`;

export const ConfigFieldsWrapper = styled(Flex)`
  height: 100%;
  flex: 1 1 0;
  overflow: auto;
  padding: ${sizes.normal};
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

export const ItemWrapper = styled(Body)`
  width: 150px;
`;
