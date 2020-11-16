import React, { useCallback } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import ReactBaseTable, { BaseTableProps, ColumnShape } from 'react-base-table';
import { Body } from '@cognite/cogs.js';
import Highlighter from 'react-highlight-words';
import {
  ResourceSelectionMode,
  useSelectionCheckbox,
} from 'lib/hooks/useSelection';
import { TableWrapper } from './TableWrapper';
import { ResourceTableColumns } from './Columns';

const ActionCell = <T extends { id: AllowedId }>({
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

const HighlightCell = ({ text, query }: { text?: string; query?: string }) => {
  return (
    <Body level={2} strong>
      <Highlighter
        searchWords={(query || '').split(' ')}
        textToHighlight={text || ''}
      />
    </Body>
  );
};

export type AllowedId = number | string;
export type TableProps<T> = Partial<BaseTableProps<T>> & {
  previewingIds?: AllowedId[];
  activeIds?: AllowedId[];
  disabledIds?: AllowedId[];
  selectedIds?: AllowedId[];
  query?: string;
  onRowClick?: (item: T, event?: React.SyntheticEvent<Element, Event>) => void;
  selectionMode?: ResourceSelectionMode;
  onRowSelected?: (item: T) => void;
};

export const Table = <T extends { id: AllowedId }>({
  previewingIds,
  activeIds,
  disabledIds,
  columns = [],
  query,
  onRowClick,
  selectedIds = [],
  selectionMode = 'none',
  onRowSelected = () => {},
  ...props
}: TableProps<T>) => {
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
  return (
    <TableWrapper>
      <AutoSizer>
        {({ width, height }) => (
          <ReactBaseTable<T>
            width={width}
            height={height}
            rowClassName={({ rowData }: { rowData: T }) => {
              const extraClasses: string[] = [];
              if (
                previewingIds &&
                previewingIds.some(el => el === rowData.id)
              ) {
                extraClasses.push('previewing');
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
                cellProps: { ...el.cellProps, query },
                cellRenderer: ({ cellData }: { cellData: string }) => (
                  <HighlightCell text={cellData} query={query} />
                ),
                ...el,
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
