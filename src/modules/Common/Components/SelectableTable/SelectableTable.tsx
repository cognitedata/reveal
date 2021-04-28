import { TableWrapper } from 'src/modules/Common/Components/FileTable/FileTableWrapper';
import AutoSizer from 'react-virtualized-auto-sizer';
import ReactBaseTable, { BaseTableProps, Column } from 'react-base-table';
import { CellRenderer, TableDataItem } from 'src/modules/Common/Types';
import React, { useMemo } from 'react';
import { StringRenderer } from 'src/modules/Common/Containers/FileTableRenderers/StringRenderer';
import { SelectionRenderer } from 'src/modules/Common/Containers/FileTableRenderers/SelectionRenderer';
import { SelectAllHeaderRenderer } from 'src/modules/Common/Containers/FileTableRenderers/SelectAllHeaderRendrerer';
import { StringHeaderRenderer } from 'src/modules/Common/Containers/FileTableRenderers/StringHeaderRenderer';

export type SelectableTableProps = Omit<
  BaseTableProps<TableDataItem>,
  'width'
> & {
  selectable: boolean;
  rendererMap: { [key: string]: (props: CellRenderer) => JSX.Element };
  onRowSelect: (id: number, selected: boolean) => void;
};

export function SelectableTable(props: SelectableTableProps) {
  const handleSelectChange = ({
    rowData,
    selected,
  }: {
    selected: boolean;
    rowData: TableDataItem;
    rowIndex: number;
  }) => {
    props.onRowSelect(rowData.id, selected);
  };

  const [rendererMap, columns] = useMemo(() => {
    if (props.selectable) {
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
        // resizable: false,
        // frozen: Column.FrozenDirection.LEFT,
        onChange: handleSelectChange,
        align: Column.Alignment.LEFT,
      };
      const cols = [selectionColumn, ...props.columns];
      return [localRendererMap, cols];
    }
    return [props.rendererMap, props.columns];
  }, [props.columns, props.selectable, props.rendererMap]);

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

  return (
    <TableWrapper>
      <AutoSizer
        style={{
          width: 'auto',
        }}
      >
        {({ width }) => (
          <ReactBaseTable<TableDataItem>
            columns={columns}
            maxHeight={Infinity}
            width={width}
            components={components}
            data={props.data}
          />
        )}
      </AutoSizer>
    </TableWrapper>
  );
}
