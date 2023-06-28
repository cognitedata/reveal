import React, { useMemo } from 'react';

import {
  getTableColumns,
  SubCellMatchingLabels,
  SummaryCardWrapper,
  Table,
  TimeDisplay,
} from '@data-exploration/components';
import {
  DocumentContentPreview,
  DocumentNamePreview,
  useDocumentsMetadataColumns,
} from '@data-exploration/containers';
import { SummaryHeader } from '@data-exploration-components/components/SummaryHeader/SummaryHeader';
import { getSummaryCardItems } from '@data-exploration-components/components/SummaryHeader/utils';
import { ColumnDef, Row } from '@tanstack/react-table';

import { Body } from '@cognite/cogs.js';
import { Asset } from '@cognite/sdk';

import {
  DASH,
  getHiddenColumns,
  InternalDocumentFilter,
  useGetSearchConfigFromLocalStorage,
  useTranslation,
} from '@data-exploration-lib/core';
import {
  InternalDocument,
  InternalDocumentWithMatchingLabels,
  useDocumentSearchResultWithMatchingLabelsQuery,
} from '@data-exploration-lib/domain-layer';

export const DocumentSummary = ({
  query = '',
  filter = {},
  onAllResultsClick,
  onRowClick,
  onRootAssetClick,
}: {
  query?: string;
  filter?: InternalDocumentFilter;
  onAllResultsClick?: (
    event?: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
  onRowClick?: (row: InternalDocument) => void;
  onRootAssetClick?: (rootAsset: Asset, resourceId?: number) => void;
}) => {
  const documentSearchConfig = useGetSearchConfigFromLocalStorage('file');

  const { results, isLoading } = useDocumentSearchResultWithMatchingLabelsQuery(
    {
      query,
      filter,
    },
    undefined,
    documentSearchConfig
  );
  const { metadataColumns, setMetadataKeyQuery } =
    useDocumentsMetadataColumns();

  const { t } = useTranslation();
  const tableColumns = getTableColumns(t);

  const columns = useMemo(
    () =>
      [
        {
          ...tableColumns.name(),
          cell: ({ row }: { row: Row<InternalDocument> }) => {
            const fileNamePreviewProps = {
              fileName: row.original.name || '',
              file: row.original,
            };
            return <DocumentNamePreview {...fileNamePreviewProps} query="" />;
          },
        },
        {
          accessorKey: 'content',
          header: t('CONTENT', 'Content'),
          cell: ({ row }: { row: Row<InternalDocument> }) => {
            return <DocumentContentPreview document={row.original} query="" />;
          },
        },
        {
          accessorKey: 'author',
          id: 'author',
          header: t('AUTHOR', 'Author'),
          cell: ({ row }: { row: Row<InternalDocument> }) => {
            return <Body level={2}>{row.original.author || DASH}</Body>;
          },
        },
        {
          id: 'directory',
          header: t('DIRECTORY', 'Directory'),
          cell: ({ row }) => {
            return (
              <Body level={2}>
                {row.original?.sourceFile?.directory || DASH}
              </Body>
            );
          },
        },
        {
          // You do not have to add an id field if accessor is given a string.
          accessorKey: 'type',
          header: t('FILE_TYPE', 'File type'),
          cell: ({ row }: { row: Row<InternalDocument> }) => {
            return <Body level={2}>{row.original.type}</Body>;
          },
        },
        {
          accessorKey: 'modifiedTime',
          header: t('LAST_UPDATED', 'Last updated'),
          cell: ({ row }: { row: Row<InternalDocument> }) => (
            <Body level={2}>
              <TimeDisplay value={row.original.modifiedTime} />
            </Body>
          ),
        },
        tableColumns.created,
        {
          ...tableColumns.rootAsset(onRootAssetClick),
          accessorFn: (doc) => doc?.assetIds?.length && doc.assetIds[0],
        },
        tableColumns.externalId(),
        tableColumns.id(),
        {
          ...tableColumns.dataSet,
          accessorFn: (document) => document.sourceFile.datasetId,
        },
        ...metadataColumns,
      ] as ColumnDef<InternalDocument>[],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, metadataColumns]
  );
  const hiddenColumns = getHiddenColumns(columns, ['name', 'content']);
  return (
    <SummaryCardWrapper>
      <Table<InternalDocumentWithMatchingLabels>
        id="document-summary-table"
        columns={columns}
        hiddenColumns={hiddenColumns}
        data={getSummaryCardItems(results)}
        columnSelectionLimit={2}
        isDataLoading={isLoading}
        tableHeaders={
          <SummaryHeader
            icon="Document"
            title={t('FILES', 'Files')}
            onAllResultsClick={onAllResultsClick}
          />
        }
        renderCellSubComponent={SubCellMatchingLabels}
        enableColumnResizing={false}
        onRowClick={onRowClick}
        onChangeSearchInput={setMetadataKeyQuery}
      />
    </SummaryCardWrapper>
  );
};
