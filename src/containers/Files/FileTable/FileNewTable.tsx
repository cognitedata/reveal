import React from 'react';

import { FileInfo } from '@cognite/sdk';
import { NewTable as Table, TableProps } from 'components/ReactTable/Table';
import { RelationshipLabels } from 'types';
import { getNewColumnsWithRelationshipLabels } from 'utils';
import { FileNamePreview } from './FileNamePreview';
import { Column, Row } from 'react-table';

export type FileTableProps = TableProps<FileWithRelationshipLabels> &
  RelationshipLabels & {
    query?: string;
  };
export type FileWithRelationshipLabels = RelationshipLabels & FileInfo;
export const FileTable = (props: FileTableProps) => {
  const { relatedResourceType, query } = props;

  const columns = [
    {
      ...Table.Columns.name,
      Cell: ({
        value: fileName,
        row,
      }: {
        value: string;
        row: Row<FileWithRelationshipLabels>;
      }) => {
        const fileNamePreviewProps = { fileName, file: row.original, query };
        return <FileNamePreview {...fileNamePreviewProps} />;
      },
    },
    Table.Columns.mimeType,
    Table.Columns.externalId,
    Table.Columns.id,
    Table.Columns.uploadedTime,
    Table.Columns.lastUpdatedTime,
    Table.Columns.created,
    Table.Columns.dataSet,
    Table.Columns.source,
    Table.Columns.assets,
    Table.Columns.labels,
  ] as Column<FileWithRelationshipLabels>[];

  const updatedColumns =
    getNewColumnsWithRelationshipLabels<FileWithRelationshipLabels>(
      columns,
      relatedResourceType === 'relationship'
    );

  return (
    <Table<FileWithRelationshipLabels>
      columns={updatedColumns}
      data={props.data}
      visibleColumns={['name', 'mimeType', 'uploadedTime']}
    />
  );
};
