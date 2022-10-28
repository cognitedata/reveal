import React, { useMemo } from 'react';

import { TableV2 as Table, TableProps } from 'components/ReactTable/V2/TableV2';

import { DocumentNamePreview } from './DocumentNamePreview';
import { DocumentContentPreview } from './DocumentContentPreview';
import { ColumnDef, Row } from '@tanstack/react-table';
import { Document } from 'domain/documents';
import { Button, Body } from '@cognite/cogs.js';
import { useQuery } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';
import { getRootAsset } from 'utils';
import { createLink } from '@cognite/cdf-utilities';
import { TimeDisplay } from 'components';

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

// TODO:DEGR-712 this is going to change with a task.
const RootAssetCell = ({ row }: { row: Row<Document> }) => {
  const sdk = useSDK();
  // TODO: Move any kind of data fetching jobs/hooks to domain layer!
  const { data: rootAsset } = useQuery(
    ['document', row.original.id, 'rootAsset'],
    () => {
      if (row.original?.assetIds?.length) {
        return getRootAsset(sdk, row.original.assetIds[0]);
      }

      return undefined;
    },
    {
      enabled: Boolean(row.original.assetIds?.length),
    }
  );
  if (rootAsset) {
    return (
      <Button
        href={createLink(`/explore/asset/${rootAsset.id}`)}
        // rel="noopener noreferrer"
        target="_blank"
        type="link"
        iconPlacement="right"
        icon="ArrowUpRight"
      >
        {rootAsset?.name}
      </Button>
    );
  }
  return null;
};

export const DocumentsTable = (props: DocumentTableProps) => {
  const { query } = props;

  const columns = useMemo(
    () =>
      [
        {
          ...Table.Columns.name,
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
          id: 'content',
          header: 'Content',
          cell: ({ row }: { row: Row<Document> }) => {
            return (
              <DocumentContentPreview document={row.original} query={query} />
            );
          },
        },
        {
          // When accessor is given a function, do not forget to add an id right after it!
          accessorFn: row => row.author,
          id: 'author',
          header: 'Author',
          cell: ({ row }: { row: Row<Document> }) => {
            return <Body level={2}>{row.original.author}</Body>;
          },
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
              <TimeDisplay
                value={row.original.modifiedTime}
                relative
                withTooltip
              />
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
        },
        Table.Columns.externalId,
        Table.Columns.id,
      ] as ColumnDef<DocumentWithRelationshipLabels>[],
    [query]
  );

  // const updatedColumns =
  //   getNewColumnsWithRelationshipLabels<DocumentWithRelationshipLabels>(
  //     columns,
  //     relatedResourceType === 'relationship'
  //   );

  // TODO: move this to common hooks while doing assets sorting?!
  const hiddenColumns = useMemo(() => {
    return (
      columns
        .filter(
          column =>
            // @ts-ignore Don't know why `accessorKey` is not recognized from the type -_-
            !visibleColumns.includes(column.accessorKey || column?.id)
        )
        // @ts-ignore
        .map(column => column.accessorKey || column.id)
    );
  }, [columns]);

  return (
    <Table
      {...props}
      columns={columns}
      hiddenColumns={hiddenColumns}
      data={props.data}
    />
  );
};
