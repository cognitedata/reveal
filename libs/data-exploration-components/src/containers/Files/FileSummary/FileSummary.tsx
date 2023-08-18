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
import { useUniqueCdfItems } from '@data-exploration-components/hooks';
import { convertResourceType } from '@data-exploration-components/types';
import { ColumnDef } from '@tanstack/react-table';
import uniqBy from 'lodash/uniqBy';

import { Asset, FileInfo } from '@cognite/sdk';

import {
  getHiddenColumns,
  InternalFilesFilters,
  isObjectEmpty,
  isSummaryCardDataCountExceed,
  useDeepMemo,
  useTranslation,
} from '@data-exploration-lib/core';
import {
  useDocumentsMetadataKeys,
  useRelatedFilesQuery,
} from '@data-exploration-lib/domain-layer';

export const FileSummary = ({
  query = '',
  filter = {},
  onAllResultsClick,
  onRowClick,
  onDirectAssetClick,
  showAllResultsWithEmptyFilters = false,
  selectedResourceExternalId: resourceExternalId,
  annotationIds = [],
}: {
  query?: string;
  filter?: InternalFilesFilters;
  onAllResultsClick?: (
    event?: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
  onRowClick?: (row: FileInfo) => void;
  onDirectAssetClick?: (directAsset: Asset, resourceId?: number) => void;
  showAllResultsWithEmptyFilters?: boolean;
  selectedResourceExternalId?: string;
  annotationIds?: number[];
}) => {
  const isQueryEnable = isObjectEmpty(filter as any)
    ? showAllResultsWithEmptyFilters
    : true;

  const { data: annotationList = [] } = useUniqueCdfItems<FileInfo>(
    'files',
    annotationIds.map((id) => ({ id })),
    true
  );

  const isAnnotationCountExceed = isSummaryCardDataCountExceed(
    annotationList.length
  );
  const api = convertResourceType('file');

  const { items: files, isFetching: isLoading } = useResourceResults<FileInfo>(
    api,
    query,
    filter,
    undefined,
    undefined,
    isQueryEnable && !isAnnotationCountExceed
  );

  const isFilesCountExceed = isSummaryCardDataCountExceed(
    files.length + annotationList.length
  );

  const { data: relatedFiles, isLoading: isRelatedFilesLoading } =
    useRelatedFilesQuery({
      resourceExternalId,
      enabled: !isFilesCountExceed,
    });

  const mergeData = useDeepMemo(
    () => uniqBy([...annotationList, ...files, ...relatedFiles], 'id'),
    [annotationList, files, relatedFiles]
  );

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

  const isDataLoading = isLoading && isQueryEnable && !isAnnotationCountExceed;
  const isRelatedDataLoading = isRelatedFilesLoading && !isFilesCountExceed;

  return (
    <SummaryCardWrapper>
      <Table
        columns={columns}
        hiddenColumns={hiddenColumns}
        data={getSummaryCardItems(mergeData)}
        isDataLoading={isDataLoading || isRelatedDataLoading}
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
