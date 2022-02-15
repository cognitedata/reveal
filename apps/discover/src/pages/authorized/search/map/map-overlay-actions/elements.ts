import styled from 'styled-components/macro';
import layers from 'utils/zindex';

import { Menu } from '@cognite/cogs.js';

import { Paper } from 'components/paper';
import { Flex, FlexAlignItems, sizes } from 'styles/layout';

const InlineBlock = styled.div`
  display: inline-block;
`;

export const AssetMenu = styled(Menu)`
  display: block;
  max-height: 60vh;
  overflow-y: auto;
`;

const BaseContainer = styled(Flex)`
  height: 40px;
  border-radius: ${sizes.small};
  background-color: white;
  align-items: center;
  box-shadow: var(--cogs-z-4);
  padding: 2px;
`;

const Container = styled(BaseContainer)`
  position: relative;
`;

export const MapSearchContainer = styled.div`
  min-width: 200px;
`;

const ButtonContainer = styled(BaseContainer)``;

export const InfoContainer = styled(BaseContainer)`
  padding: 10px ${sizes.normal};
  font-weight: 500;
  font-size: var(--cogs-t6-font-size);
  line-height: var(--cogs-t6-line-height);
  color: var(--cogs-greyscale-grey7);
`;

export const InfoMessage = styled.div`
  margin-left: 12px;
`;

export const InfoKey = styled.div`
  background: var(--cogs-greyscale-grey3);
  box-shadow: 0px 1px 0px var(--cogs-greyscale-grey4);
  border-radius: 2px;
  display: inline;
  padding: 0px 6px;
`;

export const InfoSeparator = styled.div`
  width: 1px;
  height: 20px;
  background: var(--cogs-greyscale-grey4);
  border-radius: 2px;
  margin-left: 12px;
`;

interface LayerColorDotProps {
  color: string;
}
const LayerColorDot = styled.div`
  border-radius: 50%;
  display: inline-block;
  height: 8px;
  margin-right: 3px;
  width: 8px;
  background-color: ${(props: LayerColorDotProps) => props.color};
`;

const SearchableAssetSuggestion = styled.div`
  background-color: ${(props: { isHighlighted: boolean }) =>
    props.isHighlighted ? '#efefef' : 'white'};
`;

const AssetList = styled.ul`
  list-style-type: none;
  padding: 0;
  padding-right: 8px;
  padding-top: 12px;
`;

const BasePaper = styled(Paper)`
  width: 100%;
  position: absolute;
  margin-top: 8px;

  background-color: white;
  z-index: ${layers.LAYER_SELECTOR};
  top: 50px;
  left: 0px;
  border-radius: 4px;
`;

const AssetsPaper = styled(BasePaper)`
  padding: 0px !important;
`;

const AssetListItemContainer = styled(Flex)`
  justify-content: space-between;
  align-items: center;
`;

const AssetListItem = styled.li`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  cursor: pointer;
`;

const AssetHeaderContainer = styled.div`
  padding: 16px;
  padding-bottom: 0px;
`;

const LayerWrapper = styled(Menu)`
  min-width: 256px;
`;

const LayerItem = styled(FlexAlignItems)`
  width: 100%;
  justify-content: space-between;
`;

const LicenseWrapper = styled.div`
  && input {
    height: 40px;
    border: 2px #eee !important;
    background: #fff !important;
  }
`;

export {
  InlineBlock,
  Container,
  LayerColorDot,
  ButtonContainer,
  SearchableAssetSuggestion,
  AssetList,
  AssetsPaper,
  AssetListItem,
  AssetHeaderContainer,
  LayerWrapper,
  LayerItem,
  AssetListItemContainer,
  LicenseWrapper,
};
