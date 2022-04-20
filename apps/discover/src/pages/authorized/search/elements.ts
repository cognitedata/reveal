import styled from 'styled-components/macro';
import layers from 'utils/zindex';

import { Menu } from '@cognite/cogs.js';

import { Flex, FlexColumn, FlexRow, sizes } from 'styles/layout';

import { getFilterSizeStateInPX } from './search/SideBar/constants';

export const SEARCH_BAR_WIDTH = 100; // in %

export const Empty = styled.div``;
export const MapOverlayPadding = styled.div`
  margin-top: ${sizes.large};
`;

export const SearchResultContainer = styled.div`
  margin-right: auto;
  margin-left: auto;
  height: 100%;
  width: 100%;
`;

export const HeaderWrapper = styled.div`
  max-height: 40%;
  overflow-y: auto;
`;

export const ContentWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex: 1;
  flex-direction: column;
  background-color: transparent;
`;

export const GettingStartedWrapper = styled(FlexColumn)`
  padding-top: 80px;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 400px);
  overflow: hidden;
  width: 100%;
  height: 100%;
`;

export const HeaderContainer = styled.div`
  padding-left: ${sizes.medium};
  padding-right: ${sizes.medium};
  width: 90%;
`;

export const HeaderInputWrapper = styled.div`
  width: 100%;
`;

export const DividerWrapper = styled.div`
  margin-top: ${sizes.normal};
  margin-bottom: ${sizes.normal};
`;

export const SearchWrapper = styled.div`
  overflow: hidden;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

export const ButtonDescription = styled.span`
  margin-right: 10px;
`;

export const OuterSearchWrapper = styled(Flex)`
  flex-direction: column;
  flex: 1;
  box-sizing: border-box;
  /* box-shadow: 0px 8px 48px rgba(0, 0, 0, 0.1), 0px 0px 4px rgba(0, 0, 0, 0.1); */
  background: var(--cogs-white);
  z-index: ${layers.SEARCH_HISTORY};
  width: ${(props: { expandedMode: boolean }) =>
    `${props.expandedMode ? 100 : SEARCH_BAR_WIDTH}%`};
  height: ${(props: { expandedMode: boolean }) =>
    props.expandedMode ? `100%` : `auto`};
  position: ${(props: { expandedMode: boolean }) =>
    props.expandedMode ? 'relative' : 'absolute'};
  border-radius: ${(props: { expandedMode: boolean }) =>
    props.expandedMode ? '0' : '4px'};
`;

export const OuterMapWrapper = styled.div`
  height: 100%;
  margin-right: 0px;
  position: relative;
  width: ${(props: { expandedMode: boolean }) =>
    `${props.expandedMode ? undefined : 100}% !important`};
  opacity: 1;
`;

export const MapBoxContainer = styled(Flex)`
  flex: 1;
  max-height: 100%;
`;

export const MainSearchContainer = styled(FlexColumn)`
  height: 100%;
  width: ${(props: any) =>
    `calc(100% - ${getFilterSizeStateInPX(props.isOpen)})`};
`;

export const SearchTableResultActionContainer = styled(FlexRow)`
  align-items: center;
  justify-content: space-between;
  padding-top: ${sizes.normal};
  padding-right: ${sizes.normal};
  padding-left: ${sizes.normal};
  padding-bottom: ${sizes.small};
`;

export const MetadataContainer = styled.div`
  width: 100%;
  padding: ${sizes.normal} ${sizes.normal} ${sizes.medium} 72px;
`;

export const MenuItemDanger = styled(Menu.Item)`
  color: var(--cogs-red-2);
  &:hover {
    background-color: var(--cogs-red-7);
  }
`;

export const TabsWrapper = styled.div`
  padding-left: ${sizes.normal};
  border-bottom: 1px solid var(--cogs-color-strokes-default);

  .rc-tabs-tab-btn {
    height: 67px !important;
  }
`;

export const Container = styled.div`
  display: flex;
  height: calc(100vh - 56px);
  width: 100%;
`;

export const FavoriteIndicatorContainer = styled.div`
  background: var(--cogs-bg-default);
  i {
    color: var(--cogs-bg-status-small--accent);
  }
`;
