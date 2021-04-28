import React from 'react';
import { Column, ColumnShape } from 'react-base-table';
import { TableDataItem } from 'src/modules/Common/Types';
import { StringRenderer } from 'src/modules/Common/Containers/FileTableRenderers/StringRenderer';
import { SelectableTable } from 'src/modules/Common/Components/SelectableTable/SelectableTable';
import { NameRenderer } from 'src/modules/Common/Containers/FileTableRenderers/NameRenderer';
import { AnnotationRenderer } from 'src/modules/Common/Containers/FileTableRenderers/AnnotationRenderer';
import { FileTableProps } from './types';

export function FileTableExplorer(props: FileTableProps) {
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
      key: 'annotations',
      title: 'Annotations',
      width: 0,
      flexGrow: 1,
      align: Column.Alignment.CENTER,
    },
  ];

  const rendererMap = {
    name: NameRenderer,
    mimeType: StringRenderer,
    annotations: AnnotationRenderer,
  };

  return (
    <SelectableTable
      {...props}
      columns={columns}
      rendererMap={rendererMap}
      selectable
      onRowSelect={props.onRowSelect}
    />
  );
}
