import React, { useMemo } from 'react';

import { Table, TableProps } from 'components/Table/Table';

import { DocumentNamePreview } from './DocumentNamePreview';
import { DocumentContentPreview } from './DocumentContentPreview';
import { ColumnDef, Row } from '@tanstack/react-table';
import { Document, useDocumentsMetadataKeys } from 'domain/documents';
import { DASH } from 'utils';
import { useGetHiddenColumns } from 'hooks';
import { Body } from '@cognite/cogs.js';

import {
  TimeDisplay,
  RootAsset,
  ResourceTableColumns,
} from '@data-exploration-components/components';

export type DocumentWithRelationshipLabels = Document;

// TODO: Might need to add RelationshipLabels at some point.
export type DocumentTableProps = Omit<
  TableProps<DocumentWithRelationshipLabels>,
  'columns'
> & {
  query?: string;
};

const visibleColumns = [
  'name',
  'content',
  'type',
  'modifiedTime',
  'createdTime',
  'rootAsset',
];

const RootAssetCell = ({ row }: { row: Row<Document> }) => {
  const assetId = row.original?.assetIds?.length && row.original.assetIds[0];

  if (!assetId) {
    return <>{DASH}</>;
  }

  return <RootAsset assetId={assetId} maxWidth={300} />;
};

export const DocumentsTable = (props: DocumentTableProps) => {
  const { query } = props;
  const { data: metadataKeys } = useDocumentsMetadataKeys();

  const metadataColumns: ColumnDef<DocumentWithRelationshipLabels>[] =
    useMemo(() => {
      return (metadataKeys || []).map((key: string) =>
        ResourceTableColumns.metadata(
          key,
          (row) => row?.sourceFile?.metadata?.[key] || DASH
        )
      );
    }, [metadataKeys]);

  const columns = useMemo(
    () =>
      [
        {
          ...Table.Columns.name(),
          enableHiding: false,
          cell: ({ row }: { row: Row<DocumentWithRelationshipLabels> }) => {
            const fileNamePreviewProps = {
              fileName: row.original.name || '',
              file: row.original,
            };
            return (
              <DocumentNamePreview {...fileNamePreviewProps} query={query} />
            );
          },
        },
        {
          accessorKey: 'content',
          header: 'Content',
          cell: ({ row }: { row: Row<Document> }) => {
            return (
              <DocumentContentPreview document={row.original} query={query} />
            );
          },
          enableSorting: false,
        },
        {
          accessorKey: 'author',
          id: 'author',
          header: 'Author',
          cell: ({ row }: { row: Row<Document> }) => {
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
          cell: ({ row }: { row: Row<Document> }) => {
            return <Body level={2}>{row.original.type}</Body>;
          },
        },
        {
          accessorKey: 'modifiedTime',
          header: 'Last updated',
          cell: ({ row }: { row: Row<Document> }) => (
            <Body level={2}>
              <TimeDisplay value={row.original.modifiedTime} />
            </Body>
          ),
        },
        Table.Columns.created,
        {
          id: 'rootAsset',
          header: 'Root asset',
          cell: ({ row }: { row: Row<Document> }) => {
            return <RootAssetCell row={row} />;
          },
          enableSorting: false,
        },
        Table.Columns.externalId(query),
        Table.Columns.id(query),
        ...metadataColumns,
      ] as ColumnDef<DocumentWithRelationshipLabels>[],
    [query, metadataColumns]
  );

  // const updatedColumns =
  //   getNewColumnsWithRelationshipLabels<DocumentWithRelationshipLabels>(
  //     columns,
  //     relatedResourceType === 'relationship'
  //   );

  const hiddenColumns = useGetHiddenColumns(columns, visibleColumns);

  return (
    <Table
      {...props}
      columns={columns}
      hiddenColumns={hiddenColumns}
      data={props.data}
    />
  );
};
