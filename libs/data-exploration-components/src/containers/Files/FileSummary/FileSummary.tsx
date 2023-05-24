import { ColumnDef } from '@tanstack/react-table';

import {
  ResourceTableColumns,
  SummaryCardWrapper,
  Table,
} from '@data-exploration/components';
import React, { useMemo } from 'react';
import { getSummaryCardItems } from '@data-exploration-components/components/SummaryHeader/utils';
import { useResourceResults } from '@data-exploration-components/containers';
import { convertResourceType } from '@data-exploration-components/types';
import { Asset, FileInfo } from '@cognite/sdk';
import { useDocumentsMetadataKeys } from '@data-exploration-lib/domain-layer';
import { SummaryHeader } from '@data-exploration-components/components/SummaryHeader/SummaryHeader';
import {
  getHiddenColumns,
  InternalFilesFilters,
} from '@data-exploration-lib/core';
import { FileNamePreview } from '../FileTable/FileNamePreview';

export const FileSummary = ({
  query = '',
  filter = {},
  onAllResultsClick,
  onRowClick,
  onDirectAssetClick,
}: {
  query?: string;
  filter?: InternalFilesFilters;
  onAllResultsClick?: (
    event?: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
  onRowClick?: (row: FileInfo) => void;
  onDirectAssetClick?: (directAsset: Asset, resourceId?: number) => void;
}) => {
  const api = convertResourceType('file');
  const { items: results, isFetching: isLoading } =
    useResourceResults<FileInfo>(api, query, filter);

  const { data: metadataKeys } = useDocumentsMetadataKeys();

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
        Table.Columns.externalId(),
        Table.Columns.id(),
        Table.Columns.uploadedTime,
        Table.Columns.lastUpdatedTime,
        Table.Columns.created,
        Table.Columns.dataSet,
        Table.Columns.source(),
        Table.Columns.assets(onDirectAssetClick),
        Table.Columns.labels,
        ...metadataColumns,
      ] as ColumnDef<FileInfo>[],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, metadataColumns]
  );
  const hiddenColumns = getHiddenColumns(columns, ['name', 'content']);

  return (
    <SummaryCardWrapper>
      <Table
        columns={columns}
        hiddenColumns={hiddenColumns}
        data={getSummaryCardItems(results)}
        isDataLoading={isLoading}
        id="file-summary-table"
        onRowClick={onRowClick}
        columnSelectionLimit={2}
        enableColumnResizing={false}
        tableHeaders={
          <SummaryHeader
            icon="Document"
            title="Files"
            onAllResultsClick={onAllResultsClick}
          />
        }
      />
    </SummaryCardWrapper>
  );
};
