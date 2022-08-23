import React from 'react';
import { createLink } from '@cognite/cdf-utilities';
import { Body, Flex, Graphic, Icon } from '@cognite/cogs.js';
import { Asset } from '@cognite/sdk';
import Highlighter from 'react-highlight-words';
import { Link } from 'react-router-dom';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import styled from 'styled-components';

const EmptyAssetMappingsList = () => {
  return (
    <Flex
      direction="column"
      justifyContent="center"
      alignItems="center"
      style={{ marginTop: 30 }}
    >
      <Graphic type="Search" />
      <Body>No asset mapping found.</Body>
      <Link
        to={createLink('/entity_matching/3d_matching')}
        style={{ color: 'var(--cogs-primary)' }}
      >
        Go to 3D entity matching
      </Link>
    </Flex>
  );
};

type AssetMappingsListProps = {
  assets: Asset[];
  query: string;
  selectedAssetId: number | null;
  itemCount: number;
  onClick: (assetId: number) => void;
  isItemLoaded: (index: number) => boolean;
  loadMoreItems: () => void;
};

export const AssetMappingsList = ({
  assets,
  query,
  selectedAssetId,
  itemCount,
  onClick,
  isItemLoaded,
  loadMoreItems,
}: AssetMappingsListProps) => {
  const filteredAssets =
    assets.filter(({ name, description }) => {
      const queryLower = query.toLowerCase();
      return (
        name.toLowerCase().includes(queryLower) ||
        description?.toLowerCase().includes(queryLower)
      );
    }) || [];

  if (filteredAssets.length === 0) {
    return <EmptyAssetMappingsList />;
  }
  return (
    <AssetList>
      <AutoSizer>
        {({ height, width }) => (
          <InfiniteLoader
            isItemLoaded={isItemLoaded}
            itemCount={query ? filteredAssets.length : itemCount}
            loadMoreItems={loadMoreItems}
          >
            {({ onItemsRendered, ref }) => (
              <List
                height={height}
                width={width}
                itemCount={filteredAssets.length}
                itemSize={90}
                onItemsRendered={onItemsRendered}
                ref={ref}
              >
                {({ index, style }) => {
                  if (!filteredAssets[index]) {
                    return null;
                  }

                  return (
                    <AssetListItem
                      key={filteredAssets[index].id}
                      onClick={() => onClick(filteredAssets[index].id)}
                      onKeyDown={() => onClick(filteredAssets[index].id)}
                      className={
                        selectedAssetId === filteredAssets[index].id
                          ? 'selected'
                          : ''
                      }
                      role="button"
                      tabIndex={0}
                      style={style}
                    >
                      <Flex direction="row" alignItems="center">
                        <Icon type="Assets" style={{ marginRight: 5 }} />
                        <Highlighter
                          searchWords={query.split(' ')}
                          textToHighlight={filteredAssets[index].name}
                          autoEscape
                        />
                      </Flex>
                      <Highlighter
                        searchWords={query.split(' ')}
                        textToHighlight={
                          filteredAssets[index].description || ''
                        }
                        autoEscape
                      />
                    </AssetListItem>
                  );
                }}
              </List>
            )}
          </InfiniteLoader>
        )}
      </AutoSizer>
    </AssetList>
  );
};

const AssetList = styled.div`
  height: calc(100% - 125px);
`;

const AssetListItem = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  height: 80px;
  padding: 10px;
  cursor: pointer;

  :nth-child(odd) {
    background-color: var(--cogs-greyscale-grey2);
  }

  &:hover {
    background-color: var(--cogs-greyscale-grey3);
  }

  &.selected {
    background-color: var(--cogs-midblue-6);
  }
`;
