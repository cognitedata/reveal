import React, { useCallback, useEffect, useRef } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import ReactBaseTable, { BaseTableProps, ColumnShape } from 'react-base-table';
import { Body, Tooltip } from '@cognite/cogs.js';
import Highlighter from 'react-highlight-words';
import {
  ResourceSelectionMode,
  useSelectionCheckbox,
} from 'hooks/useSelection';
import { TableStateProps, AllowedTableStateId } from 'CommonProps';
import styled, { css } from 'styled-components';
import { TableWrapper } from './TableWrapper';
import { ResourceTableColumns } from './Columns';

const ActionCell = <T extends { id: AllowedTableStateId }>({
  item,
  selectionMode,
  onItemSelected,
  isSelected,
  isHovered,
}: {
  item: T;
  selectionMode: ResourceSelectionMode;
  onItemSelected: (item: T) => void;
  isSelected: boolean;
  isHovered: boolean;
}) => {
  const button = useSelectionCheckbox(selectionMode, item.id, isSelected, () =>
    onItemSelected(item)
  );
  if (!isHovered && !isSelected) {
    return null;
  }
  return button;
};

const headerRenderer = ({
  column: { title },
}: {
  column: { title: string };
}) => (
  <Body level={3} strong>
    {title}
  </Body>
);

const HighlightCell = ({
  text,
  query,
  lines = 2,
}: {
  text?: string;
  query?: string;
  lines?: number;
}) => {
  return (
    <EllipsisText level={2} strong lines={lines}>
      <Tooltip content={text} placement="top-start" arrow={false} interactive>
        <Highlighter
          searchWords={(query || '').split(' ')}
          textToHighlight={text || ''}
          autoEscape
        />
      </Tooltip>
    </EllipsisText>
  );
};

export type TableProps<T> = Partial<BaseTableProps<T>> & {
  query?: string;
  onRowClick?: (item: T, event?: React.SyntheticEvent<Element, Event>) => void;
  selectionMode?: ResourceSelectionMode;
  onRowSelected?: (item: T) => void;
  disableScroll?: boolean;
} & TableStateProps;

export const Table = <T extends { id: AllowedTableStateId }>({
  activeIds,
  disabledIds,
  selectedIds = [],
  columns = [],
  query,
  onRowClick,
  disableScroll = false,
  selectionMode = 'none',
  onRowSelected = () => {},
  ...props
}: TableProps<T>) => {
  const ref = useRef<ReactBaseTable<T>>();
  const renderSelectButton = useCallback(
    (item: T, isSelected: boolean, isHovered: boolean) => {
      return (
        <ActionCell
          item={item}
          selectionMode={selectionMode}
          onItemSelected={onRowSelected}
          isSelected={isSelected}
          isHovered={isHovered}
        />
      );
    },
    [selectionMode, onRowSelected]
  );

  useEffect(() => {
    if (disableScroll && ref && ref.current) {
      ref.current.scrollToLeft(0);
    }
  }, [ref, disableScroll]);
  return (
    <TableWrapper disableScroll={disableScroll}>
      <AutoSizer>
        {({ width, height }) => (
          <ReactBaseTable<T>
            // @ts-ignore
            ref={ref}
            width={width}
            height={height}
            rowClassName={({ rowData }: { rowData: T }) => {
              const extraClasses: string[] = [];
              if (selectedIds && selectedIds.some(el => el === rowData.id)) {
                extraClasses.push('selected');
              }
              if (activeIds && activeIds.some(el => el === rowData.id)) {
                extraClasses.push('active');
              }
              if (disabledIds && disabledIds.some(el => el === rowData.id)) {
                extraClasses.push('disabled');
              }
              return `row clickable ${extraClasses.join(' ')}`;
            }}
            fixed
            {...props}
            rowEventHandlers={{
              onClick: ({ rowData: item, event }) => {
                if (onRowClick) {
                  onRowClick(item, event);
                }
                return event;
              },
              ...props.rowEventHandlers,
            }}
            columns={[
              ...(selectionMode !== 'none'
                ? [
                    {
                      ...Table.Columns.select,
                      dataKey: 'id',
                      selectedIds,
                      cellRenderer: ({
                        rowData: item,
                        column: { selectedIds: ids },
                        container: {
                          state: { hoveredRowKey },
                        },
                      }) => {
                        return renderSelectButton(
                          item,
                          (ids as number[]).some(el => item.id === el),
                          hoveredRowKey === item.id
                        );
                      },
                    } as ColumnShape<T>,
                  ]
                : []),
              ...columns.map((el: ColumnShape<T>) => ({
                headerRenderer,
                resizable: true,
                cellRenderer: ({ cellData }: { cellData: string }) => (
                  <HighlightCell
                    text={cellData}
                    query={query}
                    lines={el.lines}
                  />
                ),
                ...el,
                cellProps: { ...el.cellProps, query },
              })),
            ]}
          />
        )}
      </AutoSizer>
    </TableWrapper>
  );
};

Table.HighlightCell = HighlightCell;
Table.Columns = ResourceTableColumns;

export const EllipsisText = styled(Body)(
  ({ lines = 1 }: { lines?: number }) => css`
    display: block; /* Fallback for non-webkit */
    display: -webkit-box;
    -webkit-line-clamp: ${lines};
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-break: break-all;
    text-overflow: ellipsis;
  `
);
