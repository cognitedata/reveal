import React from 'react';
import { Column, ColumnShape } from 'react-base-table';
import { ResultData, TableDataItem } from 'src/modules/Common/types';
import { StringRenderer } from 'src/modules/Common/Containers/FileTableRenderers/StringRenderer';
import { SelectableTable } from 'src/modules/Common/Components/SelectableTable/SelectableTable';
import { NameRenderer } from 'src/modules/Common/Containers/FileTableRenderers/NameRenderer';
import { ActionRendererExplorer } from 'src/modules/Common/Containers/FileTableRenderers/ActionRenderer';
import { AnnotationRenderer } from 'src/modules/Common/Containers/FileTableRenderers/AnnotationRenderer';
import { DateSorter } from 'src/modules/Common/Containers/Sorters/DateSorter';
import { DateRenderer } from 'src/modules/Common/Containers/FileTableRenderers/DateRenderer';
import { NameSorter } from 'src/modules/Common/Containers/Sorters/NameSorter';
import { AnnotationLoader } from 'src/modules/Common/Components/AnnotationLoader/AnnotationLoader';
import { FileExplorerTableProps, PaginationProps } from './types';
import { SorterPaginationWrapper } from '../SorterPaginationWrapper/SorterPaginationWrapper';
import { MimeTypeSorter } from '../../Containers/Sorters/MimeTypeSorter';

const rendererMap = {
  name: NameRenderer,
  mimeType: StringRenderer,
  sourceCreatedTime: DateRenderer,
  annotations: AnnotationRenderer,
  action: ActionRendererExplorer,
};

const sorters = {
  name: NameSorter,
  mimeType: MimeTypeSorter,
  sourceCreatedTime: DateSorter,
};

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
      width: 150,
      align: Column.Alignment.LEFT,
      sortable: true,
    },
    ...(!props.modalView
      ? [
          {
            key: 'sourceCreatedTime',
            title: 'Source Created Time',
            dataKey: 'sourceCreatedTime',
            align: Column.Alignment.LEFT,
            width: 250,
            sortable: true,
          },
        ]
      : []),

    {
      key: 'annotations',
      title: 'Annotations',
      width: 0,
      flexGrow: 1,
      align: Column.Alignment.LEFT,
    },
    ...(!props.modalView
      ? [
          {
            key: 'action',
            title: '',
            dataKey: 'menu',
            align: Column.Alignment.RIGHT,
            width: 200,
          },
        ]
      : []),
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
      sorters={sorters}
      pagination
    >
      {(paginationProps: PaginationProps<TableDataItem>) => (
        <AnnotationLoader data={paginationProps.data}>
          <SelectableTable
            {...props}
            {...paginationProps}
            columns={columns}
            rendererMap={rendererMap}
            selectable
            rowClassNames={rowClassNames}
            rowEventHandlers={rowEventHandlers}
          />
        </AnnotationLoader>
      )}
    </SorterPaginationWrapper>
  );
}
