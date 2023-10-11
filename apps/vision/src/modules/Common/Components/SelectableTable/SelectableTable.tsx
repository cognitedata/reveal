import React, { useMemo, useRef } from 'react';
import ReactBaseTable, { Column, ColumnShape, RowKey } from 'react-base-table';
import AutoSizer from 'react-virtualized-auto-sizer';

import { SelectAllHeaderRenderer } from '../../Containers/FileTableRenderers/SelectAllHeaderRendrerer';
import { SelectionRenderer } from '../../Containers/FileTableRenderers/SelectionRenderer';
import { StringHeaderRenderer } from '../../Containers/FileTableRenderers/StringHeaderRenderer';
import { StringRenderer } from '../../Containers/FileTableRenderers/StringRenderer';
import { TimeHeaderRenderer } from '../../Containers/FileTableRenderers/TimeHeaderRenderer';
import {
  CellRenderer,
  SelectableTableColumnShape,
  TableDataItem,
} from '../../types';
import { TableWrapper } from '../FileTable/FileTableWrapper';
import { FileListTableProps } from '../FileTable/types';

export type SelectableTableProps = FileListTableProps<TableDataItem> & {
  selectable: boolean;
  rendererMap: { [key: string]: (props: CellRenderer) => JSX.Element };
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
  overlayRenderer: () => JSX.Element;
  emptyRenderer: () => JSX.Element;
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
    data,
    selectedIds,
    onItemSelect,
    allRowsSelected,
    onSelectAllRows,
    onSelectPage,
    sortKey,
    reverse,
    fetchedCount,
    setSortKey,
    setReverse,
    tableFooter,
    selectable,
    rowEventHandlers,
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
    onItemSelect(rowData, selected);
  };

  const fileIdsInCurrentPage = data.map((file) => file.id);

  const columns: SelectableTableColumnShape<TableDataItem>[] = useMemo(() => {
    rendererMap = {
      ...defaultCellRenderers,
      ...props.rendererMap,
    };
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
        selectedIds,
        onSelectPage,
        fileIdsInCurrentPage,
        fetchedCount,
      };
      return [selectionColumn, ...props.columns];
    }
    return props.columns;
  }, [props.columns, selectable, props.rendererMap, props.data]);

  const Cell = (cellProps: any) => {
    const renderer = rendererMap[cellProps.column.dataKey];
    if (renderer) {
      return renderer(cellProps);
    }
    return StringRenderer(cellProps);
  };

  const HeaderCell = (cellProps: any) => {
    if (cellProps.column.key === 'selected') {
      return SelectAllHeaderRenderer(cellProps);
    }
    if (cellProps.column.key === 'Timestamp') {
      return TimeHeaderRenderer({
        ...cellProps,
        sortKey,
        reverse,
        setSortKey,
        setReverse,
      });
    }

    return StringHeaderRenderer(cellProps);
  };

  const components = {
    TableCell: Cell,
    TableHeaderCell: HeaderCell,
  };

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
