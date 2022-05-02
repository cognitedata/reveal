import styled from 'styled-components/macro';

import { Dropdown as CogsDropdown, Label } from '@cognite/cogs.js';

import { Flex, FlexColumn, FlexRow, sizes } from 'styles/layout';

export const Dropdown: typeof CogsDropdown = styled(CogsDropdown)`
  .cogs-menu {
    border-radius: 6px;
  }
`;

export const DropdownLabel = styled(Label)`
  cursor: pointer;
  background: var(--cogs-bg-control--secondary);
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
`;

export const RangeSelectContainer = styled(FlexColumn)`
  width: ${(props: { width: number }) => props.width}px;
  padding: ${sizes.small};
  padding-bottom: ${sizes.normal};
`;

export const RangeSliderWrapper = styled.div`
  padding: ${sizes.small};
  margin-bottom: ${sizes.small};
  .rc-slider-mark {
    display: none;
  }
`;

export const NumberInputWrapper = styled(FlexRow)`
  margin-right: ${sizes.small};
  &:last-child {
    margin-right: 0px;
  }
`;
