import React, { useMemo } from 'react';
import { createLink } from '@cognite/cdf-utilities';
import { Body, Flex, Graphic, Icon } from '@cognite/cogs.js';
import Highlighter from 'react-highlight-words';
import { Link } from 'react-router-dom';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import styled from 'styled-components';
import { trackUsage } from 'app/utils/Metrics';
import { AugmentedMapping } from './hooks';
import { prepareSearchString, grepContains } from './utils';
import { CogniteError } from '@cognite/sdk';

const FeedbackFlex = styled(Flex)`
  padding-top: 30px;
`;
const FeedbackContainer = ({ children }: { children?: React.ReactNode }) => (
  <FeedbackFlex direction="column" justifyContent="center" alignItems="center">
    {children}
  </FeedbackFlex>
);

const EmptyAssetMappings = () => {
  return (
    <FeedbackContainer>
      <Graphic type="Search" />
      No results
    </FeedbackContainer>
  );
};

const MappingsMissing = () => {
  return (
    <FeedbackContainer>
      <Graphic type="Search" />
      <Body>No asset mapping found</Body>
      <Link
        to={createLink('/entity_matching/3d_matching')}
        style={{ color: 'var(--cogs-primary)' }}
      >
        Go to 3D entity matching
      </Link>
    </FeedbackContainer>
  );
};

const MappingsError = () => {
  return (
    <FeedbackContainer>
      <Graphic type="Search" />
      <Body>An error occured retriving masset mappings</Body>
    </FeedbackContainer>
  );
};

type AssetMappingsListProps = {
  error?: CogniteError | null;
  query: string;
  assets: AugmentedMapping[];
  selectedAssetId?: number;
  itemCount: number;
  onClick: (assetId: number) => void;
  isItemLoaded: (index: number) => boolean;
};

export const AssetMappingsList = ({
  error,
  assets,
  query,
  selectedAssetId,
  itemCount,
  onClick,
  isItemLoaded,
}: AssetMappingsListProps) => {
  const querySet = useMemo(() => prepareSearchString(query), [query]);

  const filteredAssets = useMemo(
    () =>
      querySet.size > 0
        ? assets.filter(({ searchValue }) =>
            grepContains(searchValue, querySet)
          )
        : assets,
    [assets, querySet]
  );

  if (error) {
    return <MappingsError />;
  }

  if (!assets?.length) {
    return <MappingsMissing />;
  }

  if (filteredAssets.length === 0) {
    return <EmptyAssetMappings />;
  }

  return (
    <AssetList>
      <AutoSizer>
        {({ height, width }) => (
          <InfiniteLoader
            isItemLoaded={isItemLoaded}
            itemCount={query ? filteredAssets.length : itemCount}
            loadMoreItems={() => {}}
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
                      key={filteredAssets[index].assetId}
                      onClick={() => {
                        onClick(filteredAssets[index].assetId);
                        trackUsage('Exploration.Action.Select', {
                          selectedAssetId,
                        });
                      }}
                      onKeyDown={() => onClick(filteredAssets[index].assetId)}
                      className={
                        selectedAssetId === filteredAssets[index].assetId
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
                          textToHighlight={filteredAssets[index].assetName}
                          autoEscape
                        />
                      </Flex>
                      <Highlighter
                        searchWords={query.split(' ')}
                        textToHighlight={
                          filteredAssets[index].assetDescription || ''
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
  height: calc(100% - 56px);
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
