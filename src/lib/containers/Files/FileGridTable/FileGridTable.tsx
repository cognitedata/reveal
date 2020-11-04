import React, { useEffect, useMemo, useState } from 'react';
import { FileInfo as File, FileFilterProps } from '@cognite/sdk';
import { useSelectionCheckbox } from 'lib/hooks/useSelection';
import styled, { css } from 'styled-components';
import { useResourcesState } from 'lib/context';
import { Loader, TimeDisplay } from 'lib/components';
import { useResourceResults } from 'lib/components/Search/SearchPageTable/hooks';
import { Body, Colors, DocumentIcon } from '@cognite/cogs.js';
import Highlighter from 'react-highlight-words';
import { FixedSizeGrid as Grid } from 'react-window';
import AutoResizer from 'react-virtualized-auto-sizer';
import InfiniteLoader from 'react-window-infinite-loader';
import { useFileIcon } from 'lib/hooks/sdk';
import { isFileOfType } from 'lib/utils/FileUtils';

const Cell = ({
  file,
  query,
  style,
  onClick,
  isActive,
  isPreviewing,
}: {
  file: File;
  query: string;
  isActive: boolean;
  isPreviewing: boolean;
  style: React.CSSProperties;
  onClick?: () => void;
}) => {
  const [imageUrl, setImage] = useState<string | undefined>(undefined);
  const { data, isError } = useFileIcon(file);
  const isPreviewable = isFileOfType(file, [
    'png',
    'jpg',
    'jpeg',
    'tiff',
    'gif',
  ]);
  useEffect(() => {
    if (data) {
      const arrayBufferView = new Uint8Array(data);
      const blob = new Blob([arrayBufferView]);
      setImage(URL.createObjectURL(blob));
    }
    return () => {
      setImage(url => {
        if (url) {
          URL.revokeObjectURL(url);
        }
        return undefined;
      });
    };
  }, [data]);
  const getButton = useSelectionCheckbox();

  const image = useMemo(() => {
    if (isPreviewable) {
      if (imageUrl) {
        return <img src={imageUrl} alt="" />;
      }
      if (!isError) {
        return <Loader />;
      }
    }
    return (
      <>
        <DocumentIcon file={file.name} style={{ height: 36, width: 36 }} />
        {isError && <Body level={3}>Unable to preview file.</Body>}
      </>
    );
  }, [imageUrl, isPreviewable, file, isError]);
  return (
    <PreviewCell
      onClick={onClick}
      style={style}
      isActive={isActive}
      isPreviewing={isPreviewing}
    >
      <div className="preview">{image}</div>
      <Body>
        <Highlighter
          searchWords={query.split(' ')}
          textToHighlight={file.name}
          autoEscape
        />
      </Body>
      <Body level={3}>
        <span>
          Created at: <TimeDisplay value={file.createdTime} relative />
        </span>
      </Body>
      <div className="selection">
        {getButton({ id: file.id, type: 'file' })}
      </div>
    </PreviewCell>
  );
};

type RowData = { id: number; files: File[] };

const LOOKAHEAD = 2;

export const FileGridTable = ({
  query = '',
  items,
  onItemClicked,
  columnCount = 4,
  onEndReached = () => {},
  previewIds = [],
  activeIds = [],
  isFetching = false,
  canFetchMore = false,
}: {
  query?: string;
  items?: File[];
  onItemClicked: (file: File) => void;
  columnCount?: number;
  previewIds?: number[];
  activeIds?: number[];
  onEndReached?: () => void;
  isFetching?: boolean;
  canFetchMore?: boolean;
}) => {
  // const { mode } = useResourceMode();
  if (!items || items.length === 0) {
    return <Body>No Results</Body>;
  }

  const splicedItems: RowData[] = [];

  for (let i = 0, j = items.length; i < j; i += columnCount) {
    splicedItems.push({
      id: items[i].id,
      files: items.slice(i, i + columnCount),
    });
  }

  const rowCount = Math.ceil(items.length / columnCount);
  const isItemLoaded = (index: number) => canFetchMore && index > items.length;

  return (
    <AutoResizer>
      {({ width, height }) => (
        <InfiniteLoader
          isItemLoaded={isItemLoaded}
          itemCount={items.length}
          loadMoreItems={async (_, endIndex) => {
            if (
              endIndex >= items.length - columnCount * LOOKAHEAD &&
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
              rowHeight={400}
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
              {({ columnIndex, rowIndex, style }) => {
                const file = items[columnIndex + rowIndex * columnCount];
                if (file) {
                  return (
                    <Cell
                      style={style}
                      isActive={activeIds.some(el => el === file.id)}
                      isPreviewing={previewIds.some(el => el === file.id)}
                      file={file}
                      query={query}
                      onClick={() => onItemClicked(file)}
                    />
                  );
                }
                return <></>;
              }}
            </Grid>
          )}
        </InfiniteLoader>
      )}
    </AutoResizer>
  );
};

export const FileFilterGridTable = ({
  query,
  filter = {},
  onRowClick,
}: {
  query?: string;
  filter?: FileFilterProps;
  onRowClick: (file: File) => void;
}) => {
  const [previewId, setPreviewId] = useState<number | undefined>(undefined);

  const { resourcesState } = useResourcesState();
  const currentItems = resourcesState.filter(el => el.state === 'active');

  const onItemSelected = (file: File) => {
    onRowClick(file);
    setPreviewId(file.id);
  };
  const {
    canFetchMore,
    isFetchingMore,
    fetchMore,
    isFetched,
    isFetching,
    items,
  } = useResourceResults<File>('files', query, filter);

  if (!isFetched) {
    return <Loader />;
  }

  const previewIds = previewId ? [previewId] : undefined;
  const activeIds = currentItems.map(el => el.id);

  return (
    <FileGridTable
      query={query}
      previewIds={previewIds}
      activeIds={activeIds}
      items={items}
      onItemClicked={item => onItemSelected(item)}
      onEndReached={() => {
        if (canFetchMore && !isFetchingMore) {
          fetchMore();
        }
      }}
      isFetching={isFetching}
      canFetchMore={canFetchMore}
    />
  );
};

const PreviewCell = styled.div<{ isActive: boolean; isPreviewing: boolean }>(
  props => css`
    height: 400px;
    padding: 12px;
    cursor: pointer;
    position: relative;
    .preview {
      height: 300px;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
    }
    img {
      height: 100%;
      width: 100%;
      object-fit: contain;
      background: #fff;
    }
    .cogs-body-1 {
      overflow: hidden;
      text-overflow: ellipsis;
      word-break: break-all;
      white-space: nowrap;
    }
    .selection {
      position: absolute;
      top: 24px;
      right: 24px;
    }
    ${!props.isPreviewing &&
    css`
      &&:hover {
        background: ${Colors['greyscale-grey1'].hex()};
      }
    `}

    ${props.isPreviewing &&
    css`
      background: ${Colors['midblue-7'].hex()};
    `}

    ${props.isActive &&
    css`
      background: ${Colors['greyscale-grey1'].hex()};
    `}
  `
);
