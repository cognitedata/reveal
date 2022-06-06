import styled from 'styled-components/macro';

import { Label, Menu } from '@cognite/cogs.js';

import { Flex, FlexColumn, sizes } from 'styles/layout';

import { OPTION_INDENTATION } from './constants';

export const MultiSelectCategorizedWrapper = styled.span`
  width: ${(props: { width?: number }) =>
    props.width ? `${props.width}px` : '100%'};
`;

export const DropdownContent = styled(Menu)`
  margin-top: 2px;
  width: ${(props: { width?: number }) => props.width}px;
`;

export const OptionsCategoryWrapper = styled(FlexColumn)``;

export const CategoryWrapper = styled(Menu.Item)`
  font-size: 14px;
`;

export const OptionWrapper = styled(CategoryWrapper)`
  margin-left: ${OPTION_INDENTATION};
  width: calc(100% - ${OPTION_INDENTATION});
`;

export const NoOptionsWrapper = styled(Menu.Item)`
  justify-content: center;
  color: var(--cogs-text-icon--muted);
`;

export const DropdownLabel = styled(Label)`
  cursor: pointer;
  background: var(--cogs-input-hover-background) !important;
  border: var(--cogs-input-border) !important;
  color: var(--cogs-text-primary);
  width: 100%;
  border: 2px solid transparent;
  height: 36px;
  i {
    color: var(--cogs-graphics-unknown);
  }
  :hover {
    background: var(--cogs-input-hover-background) !important;
    border: var(--cogs-input-hover-border) !important;
  }
  ${(props: { $focused: boolean }) =>
    props.$focused &&
    `
    background: var(--cogs-input-hover-background) !important;
    border: var(--cogs-input-hover-border) !important;
  `}
`;

export const DropdownValue = styled(Flex)`
  margin-left: ${sizes.extraSmall};
  margin-right: auto;
  font-weight: 400;
  ${(props: { $placeholder: boolean }) =>
    props.$placeholder &&
    `
    color: var(--cogs-text-icon--muted);
  `}
`;
