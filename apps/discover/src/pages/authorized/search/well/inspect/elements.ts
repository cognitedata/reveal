import styled from 'styled-components/macro';
import layers from 'utils/zindex';

import { Menu } from '@cognite/cogs.js';

import { Flex, FlexRow, sizes, FlexColumn } from 'styles/layout';

import { TOP_BAR_HEIGHT } from './constants';

export const SelectionWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

export const DropDownWrapper = styled.div`
  padding-left: 10px;
  padding-top: 15px;
  margin-top: 0px !important;
  width: 20%;
`;

export const TabsControllerButton = styled(Flex)`
  position: absolute;
  z-index: ${layers.TAB_SCROLL_BUTTON};
  height: 67px;
  width: 68px;
  justify-content: center;
  align-items: center;
  background: linear-gradient(
    ${(props: { right: boolean }) => (props.right ? '270deg' : '90deg')},
    var(--cogs-white) 82.81%,
    rgba(255, 255, 255, 0) 100%
  );
  cursor: pointer;
  ${(props: { right: boolean }) => (props.right ? 'right:0' : '')};
  display: ${(props: { visible: boolean }) =>
    props.visible ? 'flex' : 'none'};
  & > button {
    width: 36px;
    height: 36px;
  }
`;

export const TabsWrapper = styled(Flex)`
  padding-left: ${sizes.normal};
  padding-right: ${sizes.normal};
  border-bottom: 1px solid var(--cogs-greyscale-grey3);

  flex-shrink: 0;

  & > * .rc-tabs-content-holder {
    display: none;
  }
  & > * .rc-tabs-nav {
    height: 100%;
  }
  & > * .rc-tabs-tab-btn {
    padding-left: ${sizes.normal};
    padding-right: ${sizes.normal};
  }
  height: ${TOP_BAR_HEIGHT}px;
  .rc-tabs {
    overflow: unset;
    > * .rc-tabs-nav-operations {
      display: none;
    }
  }

  #link-tabs {
    padding: 0 ${sizes.normal};
    height: 100%;
    .cogs-icon {
      margin-left: ${sizes.small};
    }
    .cogs-icon-Up {
      display: none;
    }
    .cogs-icon-Down {
      display: inline-block;
    }
  }
  #link-tabs:hover {
    background: var(--cogs-midblue-7) !important;
  }

  #single-link-tabs {
    padding: 0 ${sizes.normal};
    height: 100%;
    border-radius: 0;
    color: var(--cogs-midblue-3);
    .cogs-icon {
      margin-left: ${sizes.small};
    }
  }
  #single-link-tabs:hover {
    background: var(--cogs-midblue-7) !important;
  }
`;

export const TabsScrollWrapper = styled(FlexRow)`
  overflow-x: auto;
  ::-webkit-scrollbar {
    height: 0;
  }
`;

export const TabsContent = styled(FlexColumn)`
  height: 100%;
  width: 100%;
  overflow: auto;
  padding: ${sizes.normal};
`;

export const LinkNode = styled(FlexRow)`
  color: var(--cogs-midblue-3);
  width: 100%;
  align-items: center;
  font-weight: 500;
  font-size: var(--cogs-t6-font-size);
  line-height: var(--cogs-t6-line-height);
  .cogs-icon {
    margin-left: auto;
    margin-right: 0;
  }
  span {
    margin-right: 10px;
  }
`;

export const ActionColumn = styled(FlexRow)`
  & > * {
    margin-right: ${sizes.small};
  }
`;

export const InspectContainer = styled.div`
  display: flex;
  height: calc(100vh - 56px);
  width: 100%;
`;

export const InspectContent = styled(FlexColumn)`
  width: ${(props: { width: string }) => props.width};
  ${(props: { standalone: boolean }) => (props.standalone ? 'width:100%' : '')};
`;

export const StandaloneHeaderWrapper = styled(FlexRow)`
  width: 100%;
  align-items: center;
`;

export const StandaloneHeaderTitle = styled(Flex)`
  font-weight: 600;
  font-size: var(--cogs-b1-font-size);
  line-height: var(--cogs-t6-line-height);
  letter-spacing: var(--cogs-t6-letter-spacing);
  color: var(--cogs-greyscale-grey9);
`;

export const LinksMenu = styled(Menu)`
  padding: ${sizes.small};
  font-weight: 500;
  font-size: var(--cogs-t6-font-size);
  line-height: var(--cogs-t6-line-height);
  margin-top: 20px;
`;

export const ThreeDeeWarningContentQuestion = styled.p`
  margin-top: 20px;
`;

export const Separator = styled(Flex)`
  margin-right: 10px;
  margin-left: 10px;
  border-right: 2px solid var(--cogs-border-default);
  height: 16px;
`;
