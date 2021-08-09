import React, { useEffect, useMemo, useRef } from 'react';
import { TableWrapper } from 'src/modules/Common/Components/FileTable/FileTableWrapper';
import AutoSizer from 'react-virtualized-auto-sizer';
import ReactBaseTable, {
  BaseTableProps,
  Column,
  ColumnShape,
  RowKey,
} from 'react-base-table';
import {
  CellRenderer,
  SelectableTableColumnShape,
  TableDataItem,
} from 'src/modules/Common/types';
import { StringRenderer } from 'src/modules/Common/Containers/FileTableRenderers/StringRenderer';
import { SelectionRenderer } from 'src/modules/Common/Containers/FileTableRenderers/SelectionRenderer';
import { SelectAllHeaderRenderer } from 'src/modules/Common/Containers/FileTableRenderers/SelectAllHeaderRendrerer';
import { StringHeaderRenderer } from 'src/modules/Common/Containers/FileTableRenderers/StringHeaderRenderer';
import { PaginatedTableProps } from 'src/modules/Common/Components/FileTable/types';

export type SelectableTableProps = Omit<
  BaseTableProps<TableDataItem>,
  'width'
> &
  PaginatedTableProps<TableDataItem> & {
    selectedRowIds: number[];
    allRowsSelected: boolean;
    selectable: boolean;
    selectedFileId?: number | null;
    rendererMap: { [key: string]: (props: CellRenderer) => JSX.Element };
    onRowSelect: (item: TableDataItem, selected: boolean) => void;
    onSelectAllRows: (val: boolean) => void;
    rowClassNames?: (data: {
      columns: ColumnShape<TableDataItem>[];
      rowData: TableDataItem;
      rowIndex: number;
    }) => string;
    rowEventHandlers?: {
      [key: string]: (args: {
        rowData: TableDataItem;
        rowIndex: number;
        rowKey: RowKey;
        event: React.SyntheticEvent;
      }) => void;
    };
  };

const defaultCellRenderers = {
  header: StringHeaderRenderer,
  selected: SelectionRenderer,
  selectedHeader: SelectAllHeaderRenderer,
};

let rendererMap: { [key: string]: (props: CellRenderer) => JSX.Element } = {};

export function SelectableTable(props: SelectableTableProps) {
  const tableRef = useRef<any>(null);
  const {
    selectedRowIds,
    allRowsSelected,
    selectable,
    data,
    sortKey,
    reverse,
    setSortKey,
    setReverse,
    rowEventHandlers,
    tableFooter,
    onRowSelect,
    onSelectAllRows,
    rowClassNames,
  } = props;

  const handleSelectChange = ({
    rowData,
    selected,
  }: {
    selected: boolean;
    rowData: TableDataItem;
    rowIndex: number;
  }) => {
    onRowSelect(rowData, selected);
  };

  const columns: SelectableTableColumnShape<TableDataItem>[] = useMemo(() => {
    rendererMap = { ...defaultCellRenderers, ...props.rendererMap };
    if (selectable) {
      const selectionColumn = {
        key: 'selected',
        title: 'All',
        dataKey: 'selected',
        width: 100,
        flexShrink: 0,
        onChange: handleSelectChange,
        align: Column.Alignment.LEFT,
        allSelected: allRowsSelected,
        onSelectAll: onSelectAllRows,
        selectedIds: selectedRowIds,
      };
      return [selectionColumn, ...props.columns];
    }
    return props.columns;
  }, [props.columns, selectable, props.rendererMap, props.data]);

  const Cell = (cellProps: any) => {
    const renderer = rendererMap[cellProps.column.key];
    if (renderer) {
      return renderer(cellProps);
    }
    return StringRenderer(cellProps);
  };

  const HeaderCell = (cellProps: any) => {
    if (cellProps.column.key === 'selected') {
      return SelectAllHeaderRenderer(cellProps);
    }
    return StringHeaderRenderer(cellProps);
  };

  const components = {
    TableCell: Cell,
    TableHeaderCell: HeaderCell,
  };

  useEffect(() => {
    if (
      props.data &&
      props.data.length &&
      props.selectedFileId &&
      tableRef.current
    ) {
      const rowIndex = props.data?.findIndex(
        (item: TableDataItem) => item.id === props.selectedFileId
      );
      if (rowIndex > 0) {
        tableRef.current.scrollToRow(rowIndex);
      }
    }
  }, [props.selectedFileId, props.data]);

  return (
    <TableWrapper>
      <AutoSizer
        style={{
          width: 'auto',
        }}
      >
        {({ width, height }) => (
          <ReactBaseTable<TableDataItem>
            ref={tableRef}
            {...props}
            columns={columns}
            width={width}
            height={height}
            components={components}
            data={data}
            rowClassName={rowClassNames}
            rowEventHandlers={rowEventHandlers}
            onColumnSort={({ key }) => {
              if (setSortKey && (key as string) !== sortKey) {
                setSortKey(key as string);
                if (setReverse && reverse) {
                  setReverse(false);
                }
              } else if (setReverse) setReverse(!reverse);
            }}
            sortBy={{
              key: sortKey || '',
              order: reverse ? 'asc' : 'desc',
            }}
            footerHeight={tableFooter ? 50 : 0}
            footerRenderer={tableFooter}
          />
        )}
      </AutoSizer>
    </TableWrapper>
  );
}
