import styled from 'styled-components/macro';

import { Menu } from '@cognite/cogs.js';

import { Flex, sizes } from 'styles/layout';

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

export const Container = styled(BaseContainer)`
  position: relative;
`;

export const MapSearchContainer = styled.div`
  min-width: 200px;
`;

export const SearchableAssetSuggestion = styled.div`
  background-color: ${(props: { isHighlighted: boolean }) =>
    props.isHighlighted ? '#efefef' : 'white'};
`;

export const AssetListItemContainer = styled(Flex)`
  justify-content: space-between;
  align-items: center;
`;

export const AssetListItem = styled.li`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  cursor: pointer;
`;

export const LicenseWrapper = styled.div`
  && input {
    height: 40px;
    border: 2px #eee !important;
    background: #fff !important;
  }
`;
