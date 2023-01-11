import React, { useMemo } from 'react';

import { FileInfo } from '@cognite/sdk';
import {
  Table,
  TableProps,
} from '@data-exploration-components/components/Table/Table';
import { RelationshipLabels } from '@data-exploration-components/types';
import { ResourceTableColumns } from '../../../components';
import { useDocumentsMetadataKeys } from '@data-exploration-lib/domain-layer';
import { FileNamePreview } from './FileNamePreview';
import { ColumnDef, SortingState } from '@tanstack/react-table';
import { useGetHiddenColumns } from '@data-exploration-components/hooks';

export type FileTableProps = Omit<
  TableProps<FileWithRelationshipLabels>,
  'columns'
> &
  RelationshipLabels & {
    query?: string;
    visibleColumns?: string[];
  };

const defaultVisibleColumns = ['name', 'mimeType', 'uploadedTime'];
export type FileWithRelationshipLabels = RelationshipLabels & FileInfo;
export const FileTable = (props: FileTableProps) => {
  const { query, visibleColumns = defaultVisibleColumns } = props;
  const { data: metadataKeys } = useDocumentsMetadataKeys();

  const [sorting, setSorting] = React.useState<SortingState>([]);

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
      enableSorting
      manualSorting={false}
      sorting={sorting}
      onSort={setSorting}
      {...props}
    />
  );
};
