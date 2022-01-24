import React from 'react';
import mime from 'mime-types';
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
import { SortKeys } from 'src/modules/Common/Utils/SortUtils';
import { FileListTableProps } from './types';

const getTimestampDataKey = (
  sortKey?: string,
  defaultTimestampKey?: string
) => {
  switch (sortKey) {
    case SortKeys.uploadedTime:
    case SortKeys.createdTime:
      return sortKey;
    default:
      return defaultTimestampKey;
  }
};

const rendererMap = {
  name: NameRenderer,
  mimeType: StringRenderer,
  createdTime: DateRenderer,
  uploadedTime: DateRenderer,
  sourceCreatedTime: DateRenderer,
  annotations: AnnotationRenderer,
  action: ActionRendererExplorer,
};

export function FileTableExplorer(props: FileListTableProps<TableDataItem>) {
  const timestampDataKey = getTimestampDataKey(
    props.sortKey,
    props.defaultTimestampKey
  );

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
      title: 'File Type',
      dataKey: 'mimeType',
      dataGetter: (
        { rowData } // Convert mime type to file type
      ) => {
        const mimeType = rowData.mimeType ? rowData.mimeType : '';
        const extension = mime.extension(mimeType) || 'Unknown';
        return extension.toUpperCase();
      },
      width: 150,
      align: Column.Alignment.LEFT,
      sortable: true,
    },
    ...(!props.modalView
      ? [
          {
            key: 'Timestamp',
            title: 'Timestamp', // This will override by TimeHeaderRenderer according to selected option
            dataKey: timestampDataKey,
            align: Column.Alignment.LEFT,
            width: 250,
            sortable: false,
          },
        ]
      : []),

    {
      key: 'annotations',
      title: 'Annotations',
      dataKey: 'annotations',
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
            dataKey: 'action',
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
    return `clickable ${props.focusedId === rowData.id && 'active'}`;
  };

  const rowEventHandlers = {
    onClick: ({ rowData }: { rowData: TableDataItem }) => {
      props.onItemClick(rowData as ResultData);
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
