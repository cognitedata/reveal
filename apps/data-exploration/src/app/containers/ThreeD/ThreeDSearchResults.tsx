import React, { useEffect } from 'react';
import {
  ThreeDModelsResponse,
  useInfinite360Images,
} from '@data-exploration-app/containers/ThreeD/hooks';
import { Body, Loader } from '@cognite/cogs.js';
import {
  ThreeDGridPreview,
  Model3DWithType,
} from '@data-exploration-app/containers/ThreeD/ThreeDGridPreview';
import { Model3D } from '@cognite/sdk';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeGrid as Grid } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { Alert } from 'antd';
import { useInfinite3DModels } from '@cognite/data-exploration';
import styled from 'styled-components';
import { useFlagNewThreeDView } from '@data-exploration-app/hooks/flags/useFlagNewThreeDView';

export const ThreeDSearchResults = ({
  query = '',
  onClick,
}: {
  query: string | undefined;
  onClick: (item: Model3DWithType) => void;
}) => {
  const {
    data: modelData = { pages: [] as ThreeDModelsResponse[] },
    isLoading,
    fetchNextPage: fetchMore,
    hasNextPage: canFetchMore,
    isFetchingNextPage: isFetchingMore,
  } = useInfinite3DModels();

  const {
    images360Data,
    hasNextPage: canFetchMoreImage360Data,
    fetchNextPage: fetchMoreImage360Data,
    isFetchingNextPage: isFetchingMoreImage360Data,
  } = useInfinite360Images();

  const isNewThreeDViewEnabled = useFlagNewThreeDView();

  useEffect(() => {
    if (canFetchMore && !isFetchingMore) {
      fetchMore();
    }
  }, [canFetchMore, fetchMore, isFetchingMore]);

  useEffect(() => {
    if (canFetchMoreImage360Data && !isFetchingMoreImage360Data) {
      fetchMoreImage360Data();
    }
  }, [
    canFetchMoreImage360Data,
    fetchMoreImage360Data,
    isFetchingMoreImage360Data,
  ]);

  const models = modelData.pages.reduce(
    (accl, t) => accl.concat(t.items),
    [] as Model3D[]
  );

  const filteredModels = [
    ...images360Data.map<Model3DWithType>((img360Data) => {
      return {
        type: 'img360',
        name: img360Data.siteName,
        siteId: img360Data.siteId,
      };
    }),
    ...models,
  ].filter((model) =>
    model.name.toLowerCase().includes(query?.toLowerCase() || '')
  );

  const itemCount = canFetchMore ? models.length + 1 : models.length;
  const isItemLoaded = (index: number) => Boolean(index < models.length);
  const loadMoreItems = () => {
    if (canFetchMore && !isFetchingMore) {
      fetchMore();
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (models.length === 0) {
    return (
      <Alert
        type="info"
        message="No resources found"
        description="No resources of this type were found in this project."
        style={{ marginTop: '50px' }}
      />
    );
  }

  return (
    <StyledThreeDSearchResults>
      <AutoSizer>
        {({ height, width }) => {
          const columnCount = Math.floor(width / 225);

          return (
            <>
              {isNewThreeDViewEnabled && (
                // This is a placeholder.
                // The actual feature will be added with the next immediate PR
                <Header>
                  <Lable level={2}>[Placeholder] New Fiter panel </Lable>
                </Header>
              )}
              <InfiniteLoader
                isItemLoaded={isItemLoaded}
                itemCount={query ? filteredModels.length : itemCount}
                loadMoreItems={loadMoreItems}
              >
                {({ onItemsRendered, ref }) => (
                  <Grid
                    height={height}
                    width={width}
                    columnWidth={width / columnCount}
                    rowHeight={225}
                    columnCount={columnCount}
                    rowCount={Math.ceil(filteredModels.length / columnCount)}
                    itemData={{
                      list: filteredModels,
                    }}
                    onItemsRendered={({
                      visibleRowStartIndex,
                      visibleRowStopIndex,
                      overscanRowStopIndex,
                      overscanRowStartIndex,
                    }) => {
                      onItemsRendered({
                        overscanStartIndex: overscanRowStartIndex,
                        overscanStopIndex: overscanRowStopIndex,
                        visibleStartIndex: visibleRowStartIndex,
                        visibleStopIndex: visibleRowStopIndex,
                      });
                    }}
                    ref={ref}
                  >
                    {({ columnIndex, rowIndex, data, style }) => {
                      const { list } = data;
                      const item = list[
                        rowIndex * columnCount + columnIndex
                      ] as Model3DWithType;
                      const modelItem = {
                        ...item,
                        type: item?.type ?? 'threeD',
                      };
                      return item ? (
                        <ThreeDGridPreview
                          item={modelItem}
                          key={item.id}
                          name={item.name}
                          modelId={item.id}
                          query={query}
                          style={style}
                          onClick={onClick}
                        />
                      ) : null;
                    }}
                  </Grid>
                )}
              </InfiniteLoader>
            </>
          );
        }}
      </AutoSizer>
    </StyledThreeDSearchResults>
  );
};

const StyledThreeDSearchResults = styled.div`
  height: 100%;
`;

const Header = styled.div`
  width: fit-content;
  display: flex;
  gap: 10px;
  padding: 16px;
  padding-bottom: 8px;
  align-items: center;
  white-space: nowrap;
`;

const Lable = styled(Body)`
  align-self: center;
`;
