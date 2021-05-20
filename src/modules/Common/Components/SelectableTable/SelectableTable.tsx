import React, { useEffect, useMemo, useRef } from 'react';
import { TableWrapper } from 'src/modules/Common/Components/FileTable/FileTableWrapper';
import AutoSizer from 'react-virtualized-auto-sizer';
import ReactBaseTable, {
  BaseTableProps,
  Column,
  ColumnShape,
  RowKey,
} from 'react-base-table';
import { CellRenderer, TableDataItem } from 'src/modules/Common/types';
import { StringRenderer } from 'src/modules/Common/Containers/FileTableRenderers/StringRenderer';
import { SelectionRenderer } from 'src/modules/Common/Containers/FileTableRenderers/SelectionRenderer';
import { SelectAllHeaderRenderer } from 'src/modules/Common/Containers/FileTableRenderers/SelectAllHeaderRendrerer';
import { StringHeaderRenderer } from 'src/modules/Common/Containers/FileTableRenderers/StringHeaderRenderer';

export type SelectableTableProps = Omit<
  BaseTableProps<TableDataItem>,
  'width'
> & {
  selectable: boolean;
  selectedFileId?: number | null;
  rendererMap: { [key: string]: (props: CellRenderer) => JSX.Element };
  onRowSelect: (item: TableDataItem, selected: boolean) => void;
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

export function SelectableTable(props: SelectableTableProps) {
  const tableRef = useRef<any>(null);
  const {
    selectable,
    data,
    sortKey,
    reverse,
    setSortKey,
    setReverse,
    rowEventHandlers,
    tableFooter,
    onRowSelect,
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

  const [rendererMap, columns] = useMemo(() => {
    if (selectable) {
      const localRendererMap = {
        ...props.rendererMap,
        selected: SelectionRenderer,
      };
      const selectionColumn = {
        key: 'selected',
        title: 'All',
        dataKey: 'selected',
        width: 100,
        flexShrink: 0,
        onChange: handleSelectChange,
        align: Column.Alignment.LEFT,
      };
      const cols = [selectionColumn, ...props.columns];
      return [localRendererMap, cols];
    }
    return [props.rendererMap, props.columns];
  }, [props.columns, selectable, props.rendererMap]);

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
              if ((key as string) !== sortKey) {
                setSortKey(key as string);
                if (reverse) {
                  setReverse(false);
                }
              } else {
                setReverse(!reverse);
              }
            }}
            sortBy={{
              key: sortKey,
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
