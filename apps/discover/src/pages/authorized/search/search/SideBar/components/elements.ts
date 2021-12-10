import styled from 'styled-components/macro';

import { Body, Button, Icon, Menu, Badge } from '@cognite/cogs.js';

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
`;

export const CheckboxFacetText = styled(Body)`
  word-wrap: break-word;
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
