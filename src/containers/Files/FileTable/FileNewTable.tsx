import React, { useMemo } from 'react';

import { FileInfo } from '@cognite/sdk';
import { NewTable as Table, TableProps } from 'components/ReactTable/Table';
import { RelationshipLabels } from 'types';
import { FileNamePreview } from './FileNamePreview';
import { Column, Row } from 'react-table';

export type FileTableProps = Omit<
  TableProps<FileWithRelationshipLabels>,
  'columns'
> &
  RelationshipLabels & {
    query?: string;
  };
export type FileWithRelationshipLabels = RelationshipLabels & FileInfo;
export const FileNewTable = (props: FileTableProps) => {
  const { query } = props;

  const columns = useMemo(
    () =>
      [
        {
          ...Table.Columns.name,
          Cell: ({
            value: fileName,
            row,
          }: {
            value: string;
            row: Row<FileInfo>;
          }) => {
            const fileNamePreviewProps = {
              fileName,
              file: row.original,
              query,
            };
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
      ] as Column<FileInfo>[],
    [query]
  );

  return (
    <Table<FileInfo>
      columns={columns}
      visibleColumns={['name', 'mimeType', 'uploadedTime']}
      {...props}
    />
  );
};
