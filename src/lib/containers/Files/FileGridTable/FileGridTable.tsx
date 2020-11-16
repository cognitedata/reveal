import React, { useEffect, useMemo, useState } from 'react';
import { FileInfo as File } from '@cognite/sdk';
import { useSelectionCheckbox } from 'lib/hooks/useSelection';
import styled, { css } from 'styled-components';
import { Loader, TimeDisplay } from 'lib/components';
import { Body, Colors, DocumentIcon } from '@cognite/cogs.js';
import Highlighter from 'react-highlight-words';
import { FixedSizeGrid as Grid } from 'react-window';
import AutoResizer from 'react-virtualized-auto-sizer';
import InfiniteLoader from 'react-window-infinite-loader';
import { useFileIcon } from 'lib/hooks/sdk';
import { isFileOfType } from 'lib/utils/FileUtils';
import { SelectableItemProps, SelectableItemsProps } from 'lib/CommonProps';
import { AllowedId } from 'lib/components/Table/Table';

const Cell = ({
  file,
  query,
  style,
  onClick,
  isActive,
  isPreviewing,
  selectionMode,
  onSelect,
  isSelected,
}: {
  file: File;
  query: string;
  isActive: boolean;
  isPreviewing: boolean;
  style: React.CSSProperties;
  onClick?: () => void;
} & SelectableItemProps) => {
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
        {useSelectionCheckbox(selectionMode, file.id, isSelected, onSelect)}
      </div>
    </PreviewCell>
  );
};

type RowData = { id: number; files: File[] };

const LOOKAHEAD = 2;
const GRID_MIN_WIDTH = 300;

export const FileGridTable = ({
  query = '',
  data,
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
}: {
  query?: string;
  data?: File[];
  onItemClicked: (file: File) => void;
  columnCount?: number;
  previewIds?: AllowedId[];
  activeIds?: AllowedId[];
  onEndReached?: () => void;
  isFetching?: boolean;
  canFetchMore?: boolean;
} & SelectableItemsProps) => {
  const [currentWidth, setCurrentWidth] = useState<number>(window.innerWidth);
  if (!data || data.length === 0) {
    return <Body>No Results</Body>;
  }

  const columnCount =
    propsColumnCount || Math.floor(currentWidth / GRID_MIN_WIDTH);

  const splicedItems: RowData[] = [];

  for (let i = 0, j = data.length; i < j; i += columnCount) {
    splicedItems.push({
      id: data[i].id,
      files: data.slice(i, i + columnCount),
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
                const file = data[columnIndex + rowIndex * columnCount];
                if (file) {
                  return (
                    <Cell
                      style={style}
                      isActive={activeIds.some(el => el === file.id)}
                      isPreviewing={previewIds.some(el => el === file.id)}
                      file={file}
                      query={query}
                      onClick={() => onItemClicked(file)}
                      selectionMode={selectionMode}
                      onSelect={() => onSelect({ type: 'file', id: file.id })}
                      isSelected={isSelected({ type: 'file', id: file.id })}
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
