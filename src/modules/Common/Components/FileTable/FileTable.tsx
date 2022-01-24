import React from 'react';
import mime from 'mime-types';
import { Column, ColumnShape } from 'react-base-table';
import { ResultData, TableDataItem } from 'src/modules/Common/types';
import { StringRenderer } from 'src/modules/Common/Containers/FileTableRenderers/StringRenderer';
import { SelectableTable } from 'src/modules/Common/Components/SelectableTable/SelectableTable';
import { NameRenderer } from 'src/modules/Common/Containers/FileTableRenderers/NameRenderer';
import { StatusRenderer } from 'src/modules/Common/Containers/FileTableRenderers/StatusRenderer';
import { AnnotationRenderer } from 'src/modules/Common/Containers/FileTableRenderers/AnnotationRenderer';
import { ActionRendererProcess } from 'src/modules/Common/Containers/FileTableRenderers/ActionRenderer';
import { AnnotationLoader } from 'src/modules/Common/Components/AnnotationLoader/AnnotationLoader';
import { LoadingTable } from 'src/modules/Common/Components/LoadingRenderer/LoadingTable';
import { NoData } from 'src/modules/Common/Components/NoData/NoData';
import { FileListTableProps } from './types';

const rendererMap = {
  name: NameRenderer,
  mimeType: StringRenderer,
  status: StatusRenderer,
  annotations: AnnotationRenderer,
  action: ActionRendererProcess,
};

export function FileTable(props: FileListTableProps<TableDataItem>) {
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
      sortable: true,
      align: Column.Alignment.LEFT,
    },
    {
      key: 'status',
      title: 'Status',
      dataKey: 'status',
      width: 250,
      align: Column.Alignment.LEFT,
    },
    {
      key: 'annotations',
      title: 'Annotations',
      dataKey: 'annotations',
      width: 0,
      flexGrow: 1,
      align: Column.Alignment.LEFT,
    },
    {
      key: 'action',
      title: '',
      dataKey: 'action',
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
    return `clickable ${props.focusedId === rowData.id && 'active'}`;
  };

  const rowEventHandlers = {
    onClick: ({ rowData }: { rowData: TableDataItem }) => {
      props.onItemClick(rowData as ResultData);
    },
  };

  const overlayRenderer = () =>
    props.isLoading ? <LoadingTable columns={columns} /> : <></>;
  const emptyRenderer = () => (props.isLoading ? <></> : <NoData />);

  return (
    <AnnotationLoader data={props.data}>
      <SelectableTable
        {...props}
        columns={columns}
        rendererMap={rendererMap}
        selectable
        rowClassNames={rowClassNames}
        rowEventHandlers={rowEventHandlers}
        overlayRenderer={overlayRenderer}
        emptyRenderer={emptyRenderer}
      />
    </AnnotationLoader>
  );
}
