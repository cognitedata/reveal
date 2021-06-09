import React from 'react';
import { Column, ColumnShape } from 'react-base-table';
import { ResultData, TableDataItem } from 'src/modules/Common/types';
import { StringRenderer } from 'src/modules/Common/Containers/FileTableRenderers/StringRenderer';
import { SelectableTable } from 'src/modules/Common/Components/SelectableTable/SelectableTable';
import { NameRenderer } from 'src/modules/Common/Containers/FileTableRenderers/NameRenderer';
import { StatusRenderer } from 'src/modules/Common/Containers/FileTableRenderers/StatusRenderer';
import { AnnotationRenderer } from 'src/modules/Common/Containers/FileTableRenderers/AnnotationRenderer';
import { ActionRendererProcess } from 'src/modules/Common/Containers/FileTableRenderers/ActionRenderer';
import { NameSorter } from 'src/modules/Common/Containers/Sorters/NameSorter';
import { AnnotationLoader } from 'src/modules/Common/Components/AnnotationLoader/AnnotationLoader';
import { FileTableProps } from './types';
import { SorterPaginationWrapper } from '../SorterPaginationWrapper/SorterPaginationWrapper';
import { MimeTypeSorter } from '../../Containers/Sorters/MimeTypeSorter';

const rendererMap = {
  name: NameRenderer,
  mimeType: StringRenderer,
  status: StatusRenderer,
  annotations: AnnotationRenderer,
  action: ActionRendererProcess,
};

const sorters = {
  name: NameSorter,
  mimeType: MimeTypeSorter,
};

export function FileTable(props: FileTableProps) {
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
      width: 150,
      sortable: true,
      align: Column.Alignment.LEFT,
    },
    {
      key: 'status',
      title: 'Status',
      width: 250,
      align: Column.Alignment.LEFT,
    },
    {
      key: 'annotations',
      title: 'Annotations',
      width: 0,
      flexGrow: 1,
      align: Column.Alignment.LEFT,
    },
    {
      key: 'action',
      title: '',
      dataKey: 'menu',
      align: Column.Alignment.RIGHT,
      width: 200,
    },
  ];

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
      sorters={sorters}
    >
      {(paginationProps) => (
        <AnnotationLoader data={paginationProps.data}>
          <SelectableTable
            {...props}
            {...paginationProps}
            columns={columns}
            rendererMap={rendererMap}
            selectable
            onRowSelect={props.onRowSelect}
            rowClassNames={rowClassNames}
            rowEventHandlers={rowEventHandlers}
            allRowsSelected={props.allRowsSelected}
            onSelectAllRows={props.onSelectAllRows}
          />
        </AnnotationLoader>
      )}
    </SorterPaginationWrapper>
  );
}
