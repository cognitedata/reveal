import React, { useMemo } from 'react';
import { createLink } from '@cognite/cdf-utilities';
import { Body, Colors, Flex, Graphic, Icon } from '@cognite/cogs.js';
import Highlighter from 'react-highlight-words';
import { Link } from 'react-router-dom';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import styled from 'styled-components';
import { trackUsage } from '@data-exploration-app/utils/Metrics';
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
    <>
      <StyledBorder />
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
                        <Icon
                          type="Assets"
                          style={{
                            position: 'absolute',
                            marginTop: 2,
                            marginLeft: '5px',
                          }}
                        />
                        <StyledFlex direction="column">
                          <StyledHighlighter
                            searchWords={query.split(' ')}
                            textToHighlight={filteredAssets[index].assetName}
                            autoEscape
                          />
                          <StyledDescriptionHighlighter
                            searchWords={query.split(' ')}
                            textToHighlight={
                              filteredAssets[index].assetDescription || ''
                            }
                            autoEscape
                          />
                        </StyledFlex>
                        <StyledItemBorder />
                      </AssetListItem>
                    );
                  }}
                </List>
              )}
            </InfiniteLoader>
          )}
        </AutoSizer>
      </AssetList>
    </>
  );
};

const StyledBorder = styled.div`
  height: 1px;
  width: 100%;
  background-color: ${Colors['border--muted']};
`;

const StyledItemBorder = styled.div`
  border-bottom: 1px solid ${Colors['border--muted']};
  width: 90%;
  position: absolute;
  top: 50%;
  left: 5%;
  bottom: 0;
`;

const StyledFlex = styled(Flex)`
  padding-left: 5px;
`;

const StyledHighlighter = styled(Highlighter)`
  margin-left: 1.5rem;
  top: 0;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${Colors['text-icon--strong']};
  font-weight: 500;
`;

const StyledDescriptionHighlighter = styled(Highlighter)`
  margin-left: 1.5rem;
  top: 0;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${Colors['text-icon--muted']};
  font-weight: 400;
`;

const AssetList = styled.div`
  height: calc(100% - 56px);
  border-radius: 4px;
`;

const AssetListItem = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  height: 80px;
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: var(--cogs-greyscale-grey3);
  }

  &.selected {
    background-color: var(--cogs-midblue-6);
  }
`;
