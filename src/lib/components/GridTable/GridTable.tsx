import React, { useState } from 'react';
import { Body } from '@cognite/cogs.js';
import { FixedSizeGrid as Grid, GridChildComponentProps } from 'react-window';
import AutoResizer from 'react-virtualized-auto-sizer';
import InfiniteLoader from 'react-window-infinite-loader';
import { SelectableItemsProps } from 'lib/CommonProps';
import { AllowedId } from 'lib/components/Table/Table';
import { Loader } from 'lib/components';

export type GridCellProps<T> = {
  item: T;
  query: string;
  isActive: boolean;
  isPreviewing: boolean;
  style: React.CSSProperties;
  onClick?: () => void;
} & SelectableItemsProps;

type RowData<T> = { id: AllowedId; items: T[] };

const LOOKAHEAD = 2;
const GRID_MIN_WIDTH = 300;
const GRID_HEIGHT = 400;

export const GridTable = <T extends { id: AllowedId }>({
  query = '',
  data,
  cellHeight = GRID_HEIGHT,
  minCellWidth = GRID_MIN_WIDTH,
  onItemClicked,
  columnCount: propsColumnCount,
  onEndReached = () => {},
  previewIds = [],
  activeIds = [],
  isFetching = false,
  canFetchMore = false,
  selectionMode,
  onSelect,
  isSelected,
  renderCell,
}: {
  query?: string;
  cellHeight?: number;
  minCellWidth?: number;
  data?: T[];
  onItemClicked: (item: T) => void;
  columnCount?: number;
  previewIds?: AllowedId[];
  activeIds?: AllowedId[];
  onEndReached?: () => void;
  isFetching?: boolean;
  canFetchMore?: boolean;
  renderCell: (props: GridCellProps<T>) => React.ReactNode;
} & SelectableItemsProps) => {
  const [currentWidth, setCurrentWidth] = useState<number>(window.innerWidth);
  if (!data || data.length === 0) {
    return <Body>No Results</Body>;
  }

  const columnCount =
    propsColumnCount || Math.max(Math.floor(currentWidth / minCellWidth), 1);

  const splicedItems: RowData<T>[] = [];

  for (let i = 0, j = data.length; i < j; i += columnCount) {
    splicedItems.push({
      id: data[i].id,
      items: data.slice(i, i + columnCount),
    });
  }

  const rowCount = Math.ceil(data.length / columnCount);
  const isItemLoaded = (index: number) => canFetchMore && index > data.length;

  return (
    <AutoResizer onResize={size => setCurrentWidth(size.width)}>
      {({ width, height }) => (
        <InfiniteLoader
          isItemLoaded={isItemLoaded}
          itemCount={data.length}
          loadMoreItems={async (_, endIndex) => {
            if (
              endIndex >= data.length - columnCount * LOOKAHEAD &&
              !isFetching &&
              canFetchMore
            ) {
              onEndReached();
            }
          }}
        >
          {({ onItemsRendered, ref }) => (
            <Grid
              columnCount={columnCount}
              columnWidth={Math.floor(width / columnCount) - 4}
              height={height}
              rowCount={rowCount}
              rowHeight={cellHeight}
              width={width}
              ref={ref}
              onItemsRendered={({
                overscanColumnStartIndex,
                overscanColumnStopIndex,
                overscanRowStartIndex,
                overscanRowStopIndex,
                visibleColumnStartIndex,
                visibleColumnStopIndex,
                visibleRowStartIndex,
                visibleRowStopIndex,
              }) =>
                onItemsRendered({
                  overscanStartIndex:
                    overscanColumnStartIndex +
                    overscanRowStartIndex * columnCount,
                  overscanStopIndex:
                    overscanColumnStopIndex +
                    overscanRowStopIndex * columnCount,
                  visibleStartIndex:
                    visibleColumnStartIndex +
                    visibleRowStartIndex * columnCount,
                  visibleStopIndex:
                    visibleColumnStopIndex + visibleRowStopIndex * columnCount,
                })
              }
            >
              {
                (({ columnIndex, rowIndex, style }) => {
                  const item = data[columnIndex + rowIndex * columnCount];
                  if (item) {
                    return renderCell({
                      style,
                      isActive: activeIds.some(el => el === item.id),
                      isPreviewing: previewIds.some(el => el === item.id),
                      item,
                      query,
                      onClick: () => onItemClicked(item),
                      selectionMode,
                      onSelect,
                      isSelected,
                    });
                  }
                  return () => (
                    <div style={style}>
                      <Loader />
                    </div>
                  );
                }) as React.FunctionComponent<GridChildComponentProps>
              }
            </Grid>
          )}
        </InfiniteLoader>
      )}
    </AutoResizer>
  );
};
