import React, { useMemo } from 'react';

import { FileInfo } from '@cognite/sdk';
import { Table, TableProps } from 'components/Table/Table';
import { RelationshipLabels } from 'types';
import { ResourceTableColumns } from '../../../components';
import { useDocumentsMetadataKeys } from '../../../domain';
import { FileNamePreview } from './FileNamePreview';
import { ColumnDef } from '@tanstack/react-table';
import { useGetHiddenColumns } from 'hooks';

const visibleColumns = ['name', 'mimeType', 'uploadedTime'];
export type FileTableProps = Omit<
  TableProps<FileWithRelationshipLabels>,
  'columns'
> &
  RelationshipLabels & {
    query?: string;
  };
export type FileWithRelationshipLabels = RelationshipLabels & FileInfo;
export const FileTable = (props: FileTableProps) => {
  const { query } = props;
  const { data: metadataKeys } = useDocumentsMetadataKeys();

  const metadataColumns: ColumnDef<FileInfo>[] = useMemo(() => {
    return (metadataKeys || []).map((key: string) =>
      ResourceTableColumns.metadata(key)
    );
  }, [metadataKeys]);

  const columns = useMemo(
    () =>
      [
        {
          ...Table.Columns.name(),
          header: 'Name',
          accessorKey: 'name',
          enableHiding: false,
          cell: ({ getValue, row }) => {
            const fileName = getValue<string>();
            const fileNamePreviewProps = {
              fileName,
              file: row.original,
              query,
            };
            return <FileNamePreview {...fileNamePreviewProps} />;
          },
        },
        Table.Columns.mimeType,
        Table.Columns.externalId(query),
        Table.Columns.id(query),
        Table.Columns.uploadedTime,
        Table.Columns.lastUpdatedTime,
        Table.Columns.created,
        Table.Columns.dataSet,
        Table.Columns.source,
        Table.Columns.assets,
        Table.Columns.labels,
        ...metadataColumns,
      ] as ColumnDef<FileInfo>[],
    [query, metadataColumns]
  );
  const hiddenColumns = useGetHiddenColumns(columns, visibleColumns);

  return (
    <Table<FileInfo>
      columns={columns}
      hiddenColumns={hiddenColumns}
      {...props}
    />
  );
};
