import React from 'react';
import { Column, ColumnShape } from 'react-base-table';
import { TableDataItem } from 'src/modules/Common/Types';
import { StringRenderer } from 'src/modules/Common/Containers/FileTableRenderers/StringRenderer';
import { SelectableTable } from 'src/modules/Common/Components/SelectableTable/SelectableTable';
import { NameRenderer } from 'src/modules/Common/Containers/FileTableRenderers/NameRenderer';
import { ActionRenderer } from 'src/modules/Common/Containers/FileTableRenderers/ActionRenderer';
import { FileExplorerTableProps } from './types';
import { DateRenderer } from '../../Containers/FileTableRenderers/DateRenderer';
import { NameSorter } from '../../Containers/Sorters/NameSorter';
import { DateSorter } from '../../Containers/Sorters/DateSorter';

export function FileTableExplorer(props: FileExplorerTableProps) {
  const columns: ColumnShape<TableDataItem>[] = [
    {
      key: 'name',
      title: 'Name',
      dataKey: 'name',
      width: 0,
      flexGrow: 1, // since table is fixed, at least one col must grow
      sortable: true,
    },
    {
      key: 'mimeType',
      title: 'Mime Type',
      dataKey: 'mimeType',
      width: 100,
    },
    {
      key: 'sourceCreatedTime',
      title: 'Source Created Time',
      dataKey: 'sourceCreatedTime',
      align: Column.Alignment.CENTER,
      width: 250,
      sortable: true,
    },
    {
      key: 'action',
      title: 'File Actions',
      dataKey: 'menu',
      align: Column.Alignment.CENTER,
      width: 200,
    },
  ];

  const rendererMap = {
    name: NameRenderer,
    mimeType: StringRenderer,
    sourceCreatedTime: DateRenderer,
    action: ActionRenderer,
  };

  const rowClassNames = ({
    rowData,
  }: {
    columns: ColumnShape<TableDataItem>[];
    rowData: TableDataItem;
    rowIndex: number;
  }) => {
    return `clickable ${props.selectedFileId === rowData.id && 'active'}`;
  };

  const rowEventHandlers = {
    onClick: ({ rowData }: { rowData: TableDataItem }) => {
      props.onRowClick(rowData.id);
    },
  };

  const sorters = {
    name: NameSorter,
    sourceCreatedTime: DateSorter,
  };

  return (
    <SelectableTable
      {...props}
      columns={columns}
      rendererMap={rendererMap}
      selectable
      onRowSelect={props.onRowSelect}
      rowClassNames={rowClassNames}
      rowEventHandlers={rowEventHandlers}
      sorters={sorters}
    />
  );
}
