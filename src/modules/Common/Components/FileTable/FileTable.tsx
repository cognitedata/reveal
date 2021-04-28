import React, { useState } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import ReactBaseTable, { BaseTableProps, Column } from 'react-base-table';
import styled from 'styled-components';
import { CellRenderer, TableDataItem } from 'src/modules/Common/Types';
import { StringRenderer } from 'src/modules/Common/Containers/FileTableRenderers/StringRenderer';
import { TableWrapper } from './FileTableWrapper';

export type FileTableProps = Omit<BaseTableProps<TableDataItem>, 'width'> & {
  selectable: boolean;
  rendererMap: { [key: string]: (props: CellRenderer) => JSX.Element };
  onRowSelect;
};

export function FileTable(props: FileTableProps) {
  const Cell = (cellProps: any) => {
    const renderer = props.rendererMap[cellProps.column.key];
    if (renderer) {
      return renderer(cellProps);
    }
    return StringRenderer(cellProps);
  };

  const components = {
    TableCell: Cell,
  };

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const handleSelectChange = ({
    selected,
    rowData,
    rowIndex,
    rowKey,
  }: {
    selected: boolean;
    rowData: any;
    rowIndex: number;
    rowKey: string;
  }) => {
    const selectedRKeys: string[] = [...selectedRowKeys];
    const key: string = rowData[rowKey];

    if (selected) {
      if (!selectedRKeys.includes(key)) selectedRKeys.push(key);
    } else {
      const index = selectedRKeys.indexOf(key);
      if (index > -1) {
        selectedRKeys.splice(index, 1);
      }
    }

    setSelectedRowKeys(selectedRKeys);

    // this.props.onRowSelect({ selected, rowData, rowIndex });
  };

  if (props.selectable) {
    const selectionColumn = {
      key: '__selection__',
      title: 'Select All',
      width: 40,
      flexShrink: 0,
      resizable: false,
      frozen: Column.FrozenDirection.LEFT,
      selectedRowKeys,
      onChange: handleSelectChange,
    };
    columns = [selectionColumn, ...columns];
  }

  return (
    <TableWrapper>
      <AutoSizer
        style={{
          width: 'auto',
        }}
      >
        {({ width }) => (
          <ReactBaseTable<TableDataItem>
            columns={props.columns}
            maxHeight={Infinity}
            width={width}
            components={components}
            {...props}
          />
        )}
      </AutoSizer>
    </TableWrapper>
  );
}

export const Action = styled.div`
  display: flex;
  align-items: flex-end;
`;

export const FileRow = styled.div`
  display: flex;
  flex: 1 1 auto;
  height: inherit;
  width: inherit;
  align-items: center;
`;

export const FileNameText = styled.div`
  display: flex;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  flex: 0 1 auto;
  display: inline-block;
`;

export const ExifIcon = styled.div`
  display: flex;
  padding-bottom: 15px;
  padding-right: 0px;
  padding-left: 0px;
  flex: 0 0 auto;
`;
