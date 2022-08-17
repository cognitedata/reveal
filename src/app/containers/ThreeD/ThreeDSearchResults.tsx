import React from 'react';
import { ThreeDModelsResponse } from 'app/containers/ThreeD/hooks';
import { Loader } from '@cognite/cogs.js';
import {
  ThreeDGridPreview,
  Model3DWithType,
} from 'app/containers/ThreeD/ThreeDGridPreview';
import { Model3D } from '@cognite/sdk';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeGrid as Grid } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { Alert } from 'antd';
import { ResourceType, useInfinite3DModels } from '@cognite/data-exploration';

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

  const models = modelData.pages.reduce(
    (accl, t) => accl.concat(t.items),
    [] as Model3D[]
  );

  const filteredModels = models.filter(model =>
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
    <div style={{ height: 'calc(100% - 80px)' }}>
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
                    const item = list[rowIndex * columnCount + columnIndex];
                    const modelItem = {
                      ...item,
                      type: 'threeD' as ResourceType,
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
    </div>
  );
};
