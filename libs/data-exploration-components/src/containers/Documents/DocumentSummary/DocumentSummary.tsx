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
import { ColumnDef, Row } from '@tanstack/react-table';
import uniqBy from 'lodash/uniqBy';

import { Body } from '@cognite/cogs.js';
import { Asset } from '@cognite/sdk';

import {
  DASH,
  getHiddenColumns,
  InternalDocumentFilter,
  isObjectEmpty,
  isSummaryCardDataCountExceed,
  useDeepMemo,
  useGetSearchConfigFromLocalStorage,
  useTranslation,
} from '@data-exploration-lib/core';
import {
  InternalDocument,
  InternalDocumentWithMatchingLabels,
  useDocumentSearchResultWithMatchingLabelsQuery,
  useRelatedDocumentsQuery,
} from '@data-exploration-lib/domain-layer';

import { SummaryHeader } from '../../../components/SummaryHeader/SummaryHeader';
import { getSummaryCardItems } from '../../../components/SummaryHeader/utils';
import { useUniqueCdfItems } from '../../../hooks';

export const DocumentSummary = ({
  query = '',
  filter = {},
  onAllResultsClick,
  onRowClick,
  onRootAssetClick,
  showAllResultsWithEmptyFilters = false,
  selectedResourceExternalId: resourceExternalId,
  annotationIds = [],
}: {
  query?: string;
  filter?: InternalDocumentFilter;
  onAllResultsClick?: (
    event?: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
  onRowClick?: (row: InternalDocument) => void;
  onRootAssetClick?: (rootAsset: Asset, resourceId?: number) => void;
  showAllResultsWithEmptyFilters?: boolean;
  selectedResourceExternalId?: string;
  annotationIds?: number[];
}) => {
  const isQueryEnable = isObjectEmpty(filter as any)
    ? showAllResultsWithEmptyFilters
    : true;

  const { data: annotationList = [] } = useUniqueCdfItems<InternalDocument>(
    'files',
    annotationIds.map((id) => ({ id })),
    true
  );
  const isAnnotationCountExceed = isSummaryCardDataCountExceed(
    annotationList.length
  );

  const documentSearchConfig = useGetSearchConfigFromLocalStorage('file');

  const { results: documents, isLoading } =
    useDocumentSearchResultWithMatchingLabelsQuery(
      {
        query,
        filter,
      },
      { enabled: isQueryEnable && !isAnnotationCountExceed },
      documentSearchConfig
    );
  const { metadataColumns, setMetadataKeyQuery } =
    useDocumentsMetadataColumns();

  const isDocumentsCountExceed = isSummaryCardDataCountExceed(
    documents.length + annotationList.length
  );

  const { data: relatedDocuments, isLoading: isRelatedDocumentsLoading } =
    useRelatedDocumentsQuery({
      resourceExternalId,
      limit: 5,
      enabled: !isDocumentsCountExceed,
    });

  const mergeData = useDeepMemo(
    () => uniqBy([...annotationList, ...documents, ...relatedDocuments], 'id'),
    [annotationList, documents, relatedDocuments]
  );

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

  const isDataLoading = isLoading && isQueryEnable && !isAnnotationCountExceed;
  const isRelatedDataLoading =
    isRelatedDocumentsLoading && !isDocumentsCountExceed;

  return (
    <SummaryCardWrapper data-testid="document-summary">
      <Table<InternalDocumentWithMatchingLabels>
        id="document-summary-table"
        columns={columns}
        hiddenColumns={hiddenColumns}
        data={getSummaryCardItems(mergeData)}
        columnSelectionLimit={2}
        isDataLoading={isDataLoading || isRelatedDataLoading}
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
