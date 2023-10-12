import React, { useEffect } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeGrid as Grid } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';

import styled from 'styled-components';

import { Alert } from 'antd';

import { Loader } from '@cognite/cogs.js';
import { Model3D } from '@cognite/sdk';

import {
  ThreeDModelsResponse,
  useInfinite360Images,
  useInfinite3DModelsQuery,
} from '@data-exploration-lib/domain-layer';

import { Model3DWithType, ThreeDGridPreview } from './ThreeDGridPreview';

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
  } = useInfinite3DModelsQuery();

  const {
    images360Data,
    hasNextPage: canFetchMoreImage360Data,
    fetchNextPage: fetchMoreImage360Data,
    isFetchingNextPage: isFetchingMoreImage360Data,
  } = useInfinite360Images();

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
          );
        }}
      </AutoSizer>
    </StyledThreeDSearchResults>
  );
};

const StyledThreeDSearchResults = styled.div`
  height: 100%;
`;
