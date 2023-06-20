import React, { useMemo } from 'react';

import {
  ResourceTableColumns,
  Table,
  TableProps,
} from '@data-exploration/components';
import { ColumnDef, SortingState } from '@tanstack/react-table';

import { Asset, FileInfo } from '@cognite/sdk';

import {
  FileWithRelationshipLabels,
  getHiddenColumns,
  RelationshipLabels,
} from '@data-exploration-lib/core';
import { useDocumentsMetadataKeys } from '@data-exploration-lib/domain-layer';

import { FileNamePreview } from './FileNamePreview';

export type FileTableProps = Omit<
  TableProps<FileWithRelationshipLabels>,
  'columns'
> &
  RelationshipLabels & {
    query?: string;
    visibleColumns?: string[];
    onDirectAssetClick?: (rootAsset: Asset, resourceId?: number) => void;
    shouldShowPreviews?: boolean;
  };

const defaultVisibleColumns = ['name', 'mimeType', 'uploadedTime'];
export const FileTable = (props: FileTableProps) => {
  const {
    query,
    visibleColumns = defaultVisibleColumns,
    onDirectAssetClick,
    shouldShowPreviews = true,
  } = props;
  const { data: metadataKeys } = useDocumentsMetadataKeys();

  const [sorting, setSorting] = React.useState<SortingState>([]);

  const metadataColumns = useMemo(() => {
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
              shouldShowPreviews,
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
        Table.Columns.source(query),
        Table.Columns.assets(onDirectAssetClick),
        Table.Columns.labels,
        ...metadataColumns,
      ] as ColumnDef<FileInfo>[],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, metadataColumns]
  );
  const hiddenColumns = getHiddenColumns(columns, visibleColumns);

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
