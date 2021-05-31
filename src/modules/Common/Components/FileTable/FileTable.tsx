import React from 'react';
import { Column, ColumnShape } from 'react-base-table';
import { ResultData, TableDataItem } from 'src/modules/Common/types';
import { StringRenderer } from 'src/modules/Common/Containers/FileTableRenderers/StringRenderer';
import { SelectableTable } from 'src/modules/Common/Components/SelectableTable/SelectableTable';
import { NameRenderer } from 'src/modules/Common/Containers/FileTableRenderers/NameRenderer';
import { StatusRenderer } from 'src/modules/Common/Containers/FileTableRenderers/StatusRenderer';
import { AnnotationRenderer } from 'src/modules/Common/Containers/FileTableRenderers/AnnotationRenderer';
import { ActionRenderer } from 'src/modules/Common/Containers/FileTableRenderers/ActionRenderer';
import { FileTableProps } from './types';
import { SorterPaginationWrapper } from '../SorterPaginationWrapper/SorterPaginationWrapper';

export function FileTable(props: FileTableProps) {
  const columns: ColumnShape<TableDataItem>[] = [
    {
      key: 'name',
      title: 'Name',
      dataKey: 'name',
      width: 0,
      flexGrow: 1, // since table is fixed, at least one col must grow
    },
    {
      key: 'mimeType',
      title: 'Mime Type',
      dataKey: 'mimeType',
      width: 100,
    },
    {
      key: 'status',
      title: 'Status',
      width: 250,
      align: Column.Alignment.CENTER,
    },
    {
      key: 'annotations',
      title: 'Annotations',
      width: 0,
      flexGrow: 1,
      align: Column.Alignment.CENTER,
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
    status: StatusRenderer,
    annotations: AnnotationRenderer,
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
      props.onRowClick(rowData as ResultData);
    },
  };

  return (
    <SorterPaginationWrapper
      data={props.data}
      totalCount={props.totalCount}
      pagination
    >
      <SelectableTable
        {...props}
        columns={columns}
        rendererMap={rendererMap}
        selectable
        onRowSelect={props.onRowSelect}
        rowClassNames={rowClassNames}
        rowEventHandlers={rowEventHandlers}
        allRowsSelected={props.allRowsSelected}
        onSelectAllRows={props.onSelectAllRows}
      />
    </SorterPaginationWrapper>
  );
}
