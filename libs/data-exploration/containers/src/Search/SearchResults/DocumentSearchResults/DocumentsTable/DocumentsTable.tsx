import React, { useMemo } from 'react';

import {
  SubCellMatchingLabels,
  Table,
  TableProps,
  TimeDisplay,
} from '@data-exploration/components';
import { ColumnDef, Row } from '@tanstack/react-table';

import { Body } from '@cognite/cogs.js';
import { Asset } from '@cognite/sdk';

import { DASH, getHiddenColumns } from '@data-exploration-lib/core';
import {
  InternalDocument,
  InternalDocumentWithMatchingLabels,
} from '@data-exploration-lib/domain-layer';

import { useDocumentsMetadataColumns } from '../useDocumentsMetadataColumns';

import { DocumentContentPreview } from './DocumentContentPreview';
import { DocumentNamePreview } from './DocumentNamePreview';
import { DocumentSummaryPreview } from './DocumentSummaryPreview';

// TODO: Might need to add RelationshipLabels at some point.
export type DocumentTableProps = Omit<
  TableProps<InternalDocumentWithMatchingLabels>,
  'columns'
> & {
  query?: string;
  onRootAssetClick?: (rootAsset: Asset, resourceId?: number) => void;
  gptColumnName?: string;
  isDocumentsGPTEnabled?: boolean;
  shouldShowPreviews?: boolean;
};

const visibleColumns = [
  'name',
  'content',
  'summary',
  'type',
  'modifiedTime',
  'createdTime',
  'rootAsset',
];

export const DocumentsTable = (props: DocumentTableProps) => {
  const { query, shouldShowPreviews = true, onRootAssetClick } = props;
  const { metadataColumns, setMetadataKeyQuery } =
    useDocumentsMetadataColumns();

  const columns = useMemo(
    () =>
      [
        {
          ...Table.Columns.name(),
          enableHiding: false,
          cell: ({ row }: { row: Row<InternalDocumentWithMatchingLabels> }) => {
            const fileNamePreviewProps = {
              fileName: row.original.name || '',
              file: row.original,
              shouldShowPreviews,
            };
            return (
              <DocumentNamePreview
                {...fileNamePreviewProps}
                shouldShowPreviews={shouldShowPreviews}
                query={query}
              />
            );
          },
        },
        {
          accessorKey: 'content',
          header: 'Content',
          cell: ({ row }: { row: Row<InternalDocument> }) => {
            return (
              <DocumentContentPreview document={row.original} query={query} />
            );
          },
          enableSorting: false,
        },
        ...(props.isDocumentsGPTEnabled
          ? [
              {
                accessorKey: 'summary',
                header: props.gptColumnName,
                cell: ({ row }: { row: Row<InternalDocument> }) => {
                  return (
                    <DocumentSummaryPreview
                      document={row.original}
                      query={query}
                    />
                  );
                },
                enableSorting: true,
                enableHiding: true,
              },
            ]
          : []),
        {
          accessorKey: 'author',
          id: 'author',
          header: 'Author',
          cell: ({ row }: { row: Row<InternalDocument> }) => {
            return <Body level={2}>{row.original.author || DASH}</Body>;
          },
        },
        {
          id: 'directory',
          header: 'Directory',
          cell: ({ row }) => {
            return (
              <Body level={2}>
                {row.original?.sourceFile?.directory || DASH}
              </Body>
            );
          },
          enableSorting: false,
        },
        {
          // You do not have to add an id field if accessor is given a string.
          accessorKey: 'type',
          header: 'File type',
          cell: ({ row }: { row: Row<InternalDocument> }) => {
            return <Body level={2}>{row.original.type}</Body>;
          },
        },
        {
          accessorKey: 'modifiedTime',
          header: 'Last updated',
          cell: ({ row }: { row: Row<InternalDocument> }) => (
            <Body level={2}>
              <TimeDisplay value={row.original.modifiedTime} />
            </Body>
          ),
        },
        Table.Columns.created,
        {
          ...Table.Columns.rootAsset(onRootAssetClick),
          accessorFn: (doc) => doc?.assetIds?.length && doc.assetIds[0],
        },
        Table.Columns.assets(onRootAssetClick),
        Table.Columns.externalId(query),
        Table.Columns.id(query),
        {
          ...Table.Columns.dataSet,
          accessorFn: (document) => document.sourceFile.datasetId,
          enableSorting: true,
        },

        ...metadataColumns,
      ] as ColumnDef<InternalDocumentWithMatchingLabels>[],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, metadataColumns, props.gptColumnName]
  );

  // const updatedColumns =
  //   getNewColumnsWithRelationshipLabels<DocumentWithRelationshipLabels>(
  //     columns,
  //     relatedResourceType === 'relationship'
  //   );

  const hiddenColumns = getHiddenColumns(columns, visibleColumns);

  return (
    <Table<InternalDocumentWithMatchingLabels>
      {...props}
      columns={columns}
      hiddenColumns={hiddenColumns}
      data={props.data}
      renderCellSubComponent={SubCellMatchingLabels}
      onChangeSearchInput={setMetadataKeyQuery}
    />
  );
};
