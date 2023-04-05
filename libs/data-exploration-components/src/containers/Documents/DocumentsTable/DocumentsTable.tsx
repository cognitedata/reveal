import React, { useMemo } from 'react';

import {
  Table,
  TableProps,
} from '@data-exploration-components/components/Table/Table';
import { SubCellMatchingLabels } from '../../../components/Table/components/SubCellMatchingLabel';

import { DocumentNamePreview } from './DocumentNamePreview';
import { DocumentContentPreview } from './DocumentContentPreview';
import { ColumnDef, Row } from '@tanstack/react-table';
import {
  InternalDocument,
  InternalDocumentWithMatchingLabels,
} from '@data-exploration-lib/domain-layer';
import { DASH } from '@data-exploration-components/utils';
import { useGetHiddenColumns } from '@data-exploration-components/hooks';
import { Body } from '@cognite/cogs.js';

import { TimeDisplay } from '@data-exploration-components/components';
import { Asset } from '@cognite/sdk';
import { DocumentSummaryPreview } from './DocumentSummaryPreview';
import { useDocumentsMetadataColumns } from '../hooks/useDocumentsMetadataColumns';

// TODO: Might need to add RelationshipLabels at some point.
export type DocumentTableProps = Omit<
  TableProps<InternalDocumentWithMatchingLabels>,
  'columns'
> & {
  query?: string;
  onRootAssetClick?: (rootAsset: Asset, resourceId?: number) => void;
};

const visibleColumns = [
  'name',
  'content',
  'type',
  'modifiedTime',
  'createdTime',
  'rootAsset',
];

export const DocumentsTable = (props: DocumentTableProps) => {
  const { query, onRootAssetClick } = props;

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
            };
            return <DocumentNamePreview {...fileNamePreviewProps} query="" />;
          },
        },
        {
          accessorKey: 'content',
          header: 'Content',
          cell: ({ row }: { row: Row<InternalDocument> }) => {
            return <DocumentContentPreview document={row.original} query="" />;
          },
          enableSorting: false,
        },
        {
          accessorKey: 'summary',
          header: 'Summary',
          cell: ({ row }: { row: Row<InternalDocument> }) => {
            return <DocumentSummaryPreview document={row.original} query="" />;
          },
          enableSorting: false,
        },
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
        Table.Columns.externalId(),
        Table.Columns.id(),
        {
          ...Table.Columns.dataSet,
          accessorFn: (document) => document.sourceFile.datasetId,
          enableSorting: true,
        },

        ...metadataColumns,
      ] as ColumnDef<InternalDocumentWithMatchingLabels>[],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, metadataColumns]
  );

  // const updatedColumns =
  //   getNewColumnsWithRelationshipLabels<DocumentWithRelationshipLabels>(
  //     columns,
  //     relatedResourceType === 'relationship'
  //   );

  const hiddenColumns = useGetHiddenColumns(columns, visibleColumns);

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
