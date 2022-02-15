import styled from 'styled-components/macro';

import { MS_TRANSITION_TIME } from 'pages/authorized/search/search/SideBar/constants';
import { Flex, FlexColumn, FlexRow, sizes } from 'styles/layout';

import { TOP_BAR_HEIGHT } from '../constants';

import { SIDEBAR_SIZE } from './constants';

export const SidebarContainer = styled(FlexColumn)`
  height: 100%;
  ${(props: { hidden: boolean }) => (props.hidden ? 'display:none;' : '')};
  width: ${(props: { isOpen: boolean }) => (props.isOpen ? '100%' : '62px')};
  min-width: 62px;
`;

export const SidebarHeader = styled(FlexRow)`
  border-right: 1px solid var(--cogs-color-strokes-default);
  border-bottom: 1px solid var(--cogs-color-strokes-default);
  height: ${TOP_BAR_HEIGHT}px;
  width: 100%;
  align-items: center;
  ${(props: { isOpen: boolean }) =>
    props.isOpen
      ? `padding-left:${sizes.normal};`
      : 'justify-content: center;'};
`;

export const SidebarHeaderContent = styled(FlexColumn)`
  margin-left: ${sizes.small};
  display: ${(props: { isOpen: boolean }) => (props.isOpen ? 'flex' : 'none')};
`;
export const HeaderPrimaryContent = styled(Flex)`
  font-weight: 600;
  letter-spacing: var(--cogs-t5-letter-spacing);
  color: var(--cogs-greyscale-grey9);
  font-size: var(--cogs-t5-font-size);
  line-height: var(--cogs-t5-line-height);
`;
export const HeaderSecondaryContent = styled(Flex)`
  font-weight: 500;
  font-size: var(--cogs-detail-font-size);
  line-height: var(--cogs-o1-line-height);
  letter-spacing: var(--cogs-micro-letter-spacing);
  color: var(--cogs-greyscale-grey7);
  margin: ${sizes.extraSmall} 0px;
`;

export const HeaderBack = styled.div`
  cursor: pointer;
  & > span {
    display: flex;
  }
`;

export const HideButtonContainer = styled.div`
  padding: ${sizes.normal};
  width: 100%;
  height: 68px;
  border-top: 1px solid var(--cogs-color-strokes-default);
`;

export const SidebarContentWrapper = styled(FlexColumn)`
  width: ${(props: { isOpen: boolean }) =>
    props.isOpen ? '100%' : `${SIDEBAR_SIZE.closed}px`};
  height: calc(100% - ${TOP_BAR_HEIGHT}px);
  transition: ${MS_TRANSITION_TIME}ms;
  border-right: 1px solid var(--cogs-color-strokes-default);
`;
export const SidebarContent = styled(FlexColumn)`
  width: 100%;
  height: calc(100% - ${TOP_BAR_HEIGHT}px);
  padding: ${sizes.normal};
  padding-bottom: ${sizes.small};
  overflow-y: auto;
`;

export const SidebarContentBlock = styled(FlexColumn)`
  width: 100%;
  background: var(--cogs-greyscale-grey1);
  border-radius: 6px;
  margin-bottom: ${sizes.small};
`;

export const BlockHeader = styled(FlexColumn)`
  width: 100%;
  padding: ${sizes.normal} 12px;
  > * .checkbox-ui {
    margin-right: 12px;
  }
`;

export const WellLabel = styled(Flex)`
  width: 100%;
  font-size: var(--cogs-micro-font-size);
  line-height: var(--cogs-micro-line-height);
  letter-spacing: var(--cogs-micro-letter-spacing);
  color: var(--cogs-greyscale-grey6);
  margin-bottom: ${sizes.extraSmall};
`;

export const WellLabelValue = styled(Flex)`
  width: 100%;
  font-weight: 600;
  font-size: var(--cogs-t6-font-size);
  line-height: var(--cogs-t6-line-height);
  letter-spacing: var(--cogs-t6-letter-spacing);
  color: var(--cogs-greyscale-grey9);
`;

export const BlockContent = styled(FlexColumn)`
  width: 100%;
  border-top: 1px solid var(--cogs-greyscale-grey3);
  padding: ${sizes.normal} 12px;
  padding-bottom: ${sizes.extraSmall};
`;

export const BlockContentItem = styled(Flex)`
  width: 100%;
  font-size: var(--cogs-t6-font-size);
  line-height: var(--cogs-t6-line-height);
  color: var(--cogs-greyscale-grey9);
  margin-bottom: 12px;
  > * .checkbox-ui {
    margin-right: 12px;
    ${(props: { overlay: boolean }) =>
      props.overlay
        ? 'border-image: repeating-linear-gradient(45deg,rgba(0, 0, 0, 0.3) 0, rgba(0, 0, 0, 0.3) 1px,rgba(0, 0, 0, 0) 0,rgba(0, 0, 0, 0) 50%) !important;background-image: repeating-linear-gradient(45deg,rgba(0, 0, 0, 0.3) 0,rgba(0, 0, 0, 0.3) 1px,rgba(0, 0, 0, 0) 0,rgba(0, 0, 0, 0) 50%) !important;'
        : ''};
  }
`;

export const CheckboxContent = styled(Flex)`
  width: calc(100% - 24px);
`;
