import styled from 'styled-components/macro';

import { Overline } from '@cognite/cogs.js';

import layers from '_helpers/zindex';
import { Flex, FlexColumn, sizes, FlexAlignItems, Center } from 'styles/layout';

import { getFilterSizeStateInPX, MS_TRANSITION_TIME } from './constants';
import { OpenStatus } from './types';

export const FilterBarContainer = styled(Flex)`
  width: ${(props: { isOpen: boolean }) =>
    getFilterSizeStateInPX(props.isOpen)};
  /* Has to be calculated :( because layout is being re-painted  */
  height: ${(props: { isOpen: boolean }) =>
    props.isOpen ? 'calc(100% - 68px)' : '100%'};
  transition: ${MS_TRANSITION_TIME}ms;
  border-right: 1px solid var(--cogs-color-strokes-default);
`;

export const FilterContainer = styled(FlexColumn)`
  height: 100%;
  width: 100%;
  overflow-x: hidden;
  & > .cogs-collapse {
    padding: ${sizes.normal};
    background-color: var(--cogs-white);
    height: calc(100% - 136px);
    overflow-y: auto;
    .rc-collapse-item:first-child {
      margin-top: 0 !important;
    }
    .rc-collapse-item:last-child {
      margin-bottom: 0 !important;
    }
  }
`;

export const FilterTitle = styled(Overline)`
  && {
    color: var(--cogs-text-color-secondary);
  }
`;

// export const FilterSubtitle = sty

export const HeaderTitleContainer = styled(FlexAlignItems)`
  position: sticky;
  top: 0;
  z-index: ${layers.FILTER_HEADER};
  background-color: white;
  height: 56px;
  width: 100%;
  white-space: nowrap;
  border-bottom: ${({ isOpen }: OpenStatus) =>
    isOpen
      ? '1px solid var(--cogs-color-strokes-default)'
      : '1px solid transparent'};
  padding-left: ${sizes.normal};
  cursor: default;

  & > .cogs-icon {
    cursor: pointer;
    margin-right: ${sizes.small};
    min-width: 16px;
    color: var(--cogs-t4-color);
  }
`;

export const CollapseContainer = styled(Center)`
  align-items: flex-end;
  width: 100%;
  height: ${({ isOpen }: OpenStatus) => (isOpen ? '68px' : '100%')};
  border-top: ${({ isOpen }: OpenStatus) =>
    isOpen ? '1px solid var(--cogs-greyscale-grey3)' : 'none'};
  margin-top: auto;
  Button {
    width: 100%;
  }
`;

export const HideButtonContainer = styled.div`
  padding: ${sizes.normal};
  width: 100%;
`;
