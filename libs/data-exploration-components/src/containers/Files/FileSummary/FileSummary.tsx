import React, { useMemo } from 'react';

import {
  getTableColumns,
  SummaryCardWrapper,
  Table,
} from '@data-exploration/components';
import { FileNamePreview } from '@data-exploration/containers';
import { SummaryHeader } from '@data-exploration-components/components/SummaryHeader/SummaryHeader';
import { getSummaryCardItems } from '@data-exploration-components/components/SummaryHeader/utils';
import { useResourceResults } from '@data-exploration-components/containers';
import { convertResourceType } from '@data-exploration-components/types';
import { ColumnDef } from '@tanstack/react-table';

import { Asset, FileInfo } from '@cognite/sdk';

import {
  getHiddenColumns,
  InternalFilesFilters,
  useTranslation,
} from '@data-exploration-lib/core';
import { useDocumentsMetadataKeys } from '@data-exploration-lib/domain-layer';

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
  const { t } = useTranslation();
  const tableColumns = getTableColumns(t);
  const { data: metadataKeys } = useDocumentsMetadataKeys();

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
        tableColumns.mimeType,
        tableColumns.externalId(),
        tableColumns.id(),
        tableColumns.uploadedTime,
        tableColumns.lastUpdatedTime,
        tableColumns.created,
        tableColumns.dataSet,
        tableColumns.source(),
        tableColumns.assets(onDirectAssetClick),
        tableColumns.labels,
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
            title={t('FILES', 'Files')}
            onAllResultsClick={onAllResultsClick}
          />
        }
      />
    </SummaryCardWrapper>
  );
};
