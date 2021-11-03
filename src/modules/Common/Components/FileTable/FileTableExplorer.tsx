import React from 'react';
import { Column, ColumnShape } from 'react-base-table';
import { ResultData, TableDataItem } from 'src/modules/Common/types';
import { StringRenderer } from 'src/modules/Common/Containers/FileTableRenderers/StringRenderer';
import { SelectableTable } from 'src/modules/Common/Components/SelectableTable/SelectableTable';
import { NameRenderer } from 'src/modules/Common/Containers/FileTableRenderers/NameRenderer';
import { ActionRendererExplorer } from 'src/modules/Common/Containers/FileTableRenderers/ActionRenderer';
import { AnnotationRenderer } from 'src/modules/Common/Containers/FileTableRenderers/AnnotationRenderer';
import { DateRenderer } from 'src/modules/Common/Containers/FileTableRenderers/DateRenderer';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { LoadingTable } from 'src/modules/Common/Components/LoadingRenderer/LoadingTable';
import { NoData } from 'src/modules/Common/Components/NoData/NoData';
import { FileListTableProps } from './types';

const rendererMap = {
  name: NameRenderer,
  mimeType: StringRenderer,
  createdTime: DateRenderer,
  sourceCreatedTime: DateRenderer,
  annotations: AnnotationRenderer,
  action: ActionRendererExplorer,
};

export function FileTableExplorer(props: FileListTableProps<TableDataItem>) {
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
            key: 'createdTime',
            title: 'Created Time',
            dataKey: 'createdTime',
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
      sortable: true,
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
    return `clickable ${props.focusedFileId === rowData.id && 'active'}`;
  };

  const rowEventHandlers = {
    onClick: ({ rowData }: { rowData: TableDataItem }) => {
      props.onRowClick(rowData as ResultData);
    },
  };

  const loadingAnnotations = useSelector(
    ({ explorerReducer }: RootState) => explorerReducer.loadingAnnotations
  );

  const overlayRenderer = () =>
    props.isLoading ? <LoadingTable columns={columns} /> : <></>;
  const emptyRenderer = () => (props.isLoading ? <></> : <NoData />);

  return (
    <SelectableTable
      {...props}
      columns={columns}
      rendererMap={rendererMap}
      selectable
      rowClassNames={rowClassNames}
      rowEventHandlers={rowEventHandlers}
      disabled={loadingAnnotations}
      overlayRenderer={overlayRenderer}
      emptyRenderer={emptyRenderer}
    />
  );
}
