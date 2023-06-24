import React, { useMemo } from 'react';

import {
  getTableColumns,
  Table,
  TableProps,
} from '@data-exploration/components';
import { ColumnDef, SortingState } from '@tanstack/react-table';

import { Asset, FileInfo } from '@cognite/sdk';

import {
  FileWithRelationshipLabels,
  getHiddenColumns,
  RelationshipLabels,
  useTranslation,
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
  const { t } = useTranslation();
  const tableColumns = getTableColumns(t);

  const [sorting, setSorting] = React.useState<SortingState>([]);

  const metadataColumns = useMemo(() => {
    return (metadataKeys || []).map((key: string) =>
      tableColumns.metadata(key)
    );
  }, [metadataKeys]);

  const columns = useMemo(
    () =>
      [
        {
          ...tableColumns.name(),
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
        tableColumns.mimeType,
        tableColumns.externalId(query),
        tableColumns.id(query),
        tableColumns.uploadedTime,
        tableColumns.lastUpdatedTime,
        tableColumns.created,
        tableColumns.dataSet,
        tableColumns.source(query),
        tableColumns.assets(onDirectAssetClick),
        tableColumns.labels,
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
