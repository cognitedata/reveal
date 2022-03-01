import styled from 'styled-components/macro';

import { Body, Button, Icon, Menu, Badge, Collapse } from '@cognite/cogs.js';

import { FlexAlignItems, FlexColumn, sizes } from 'styles/layout';

export const CheckboxContainer = styled(FlexColumn)`
  width: 100%;
  margin-bottom: ${sizes.normal};

  & > label {
    margin-bottom: ${sizes.normal};
  }
  & > label:last-child {
    margin-bottom: 0px;
  }
`;

export const CheckboxTitle = styled(FlexColumn)`
  width: 100%;
  margin-bottom: ${sizes.small};
  & > span {
    color: var(--cogs-greyscale-grey9);
    font-weight: 500;
  }
`;

export const CheckboxItemContainer = styled(FlexAlignItems)`
  justify-content: space-between;
  flex: 1;
  width: 230px;
`;

export const CheckboxFacetText = styled(Body)`
  word-wrap: break-word;
  max-width: 180px;
  overflow: hidden;
  text-transform: capitalize;
  text-align: left;
  color: ${(props?: { disabled: boolean }) =>
    props?.disabled ? 'var(--cogs-greyscale-grey6)' : 'var(text-primary)'};
`;

export const Content = styled.div`
  display: flex;
  justify-content: center;
`;
export const DateRangeContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 8px;
  border-bottom: 1px solid var(--cogs-color-strokes-default);

  .rc-tabs-tab-btn {
    font-weight: 400;
  }
`;

export const ClearButton = styled(Button)`
  margin-left: auto;
  color: var(--cogs-greyscale-grey7);
`;

export const CategoryItem = styled(Menu.Item)`
  ${(props: { selected: boolean }) =>
    props.selected ? 'color: var(--cogs-primary);' : ''};
`;

export const CategoryMenu = styled(Menu)`
  min-width: 156px;
`;

export const ForwardIcon = styled(Icon)`
  margin: ${sizes.small};
  cursor: pointer;
  min-width: 16px;
  color: var(--cogs-grayscale-gray5);
`;

export const StatViewer = styled.span`
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  margin-right: -4px;
`;

export const ResultsCountBadge = styled(Badge)`
  padding: 2px 6px;
  border-radius: 4px;
  background: var(
    ${(props: { disabled: boolean }) =>
      props.disabled ? '--cogs-greyscale-grey2' : '--cogs-midblue-7'}
  ) !important;
  color: var(
    ${(props: { disabled: boolean }) =>
      props.disabled ? '--cogs-greyscale-grey7' : '--cogs-midblue-2'}
  ) !important;
  font-weight: 500;
`;

const { Panel: DefaultPanel } = Collapse;

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
  }
  & > .rc-collapse-header > i {
    order: 1;
  }
  & > .rc-collapse-anim {
    overflow: hidden !important;
  }
  & > .rc-collapse-content-active {
    border-top: 1px solid var(--cogs-color-strokes-default);
    background: transparent;
    padding: 0 16px !important;
    overflow: visible;
    & > .rc-collapse-content-box {
      margin: 0;
      padding-top: ${sizes.normal};
      padding-bottom: ${sizes.extraSmall};
    }
  }
  border-top: none !important;
  margin: 10px 0;
  background-color: var(--cogs-greyscale-grey1);
  border-radius: 6px;
`;

export const Container = styled(FlexColumn)`
  justify-content: center;
  order: -1;
  margin-right: 8px;
`;
