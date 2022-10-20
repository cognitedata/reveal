import React, { useMemo } from 'react';

import { NewTable as Table, TableProps } from 'components/ReactTable/Table';

import { DocumentNamePreview } from './DocumentNamePreview';
import { DocumentContentPreview } from './DocumentContentPreview';
import { Column, Row } from 'react-table';
import { Document } from 'domain/documents';
import { Button, Body } from '@cognite/cogs.js';
import { useQuery } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';
import { getRootAsset } from 'utils';
import { createLink } from '@cognite/cdf-utilities';
import { TimeDisplay } from 'components';

// TODO: Might need to add RelationshipLabels at some point.
export type DocumentTableProps = Omit<
  TableProps<DocumentWithRelationshipLabels>,
  'columns'
> & {
  query?: string;
};
export type DocumentWithRelationshipLabels = Document;

export const DocumentsTable = (props: DocumentTableProps) => {
  const { query } = props;
  const sdk = useSDK();

  const columns = useMemo(
    () =>
      [
        {
          ...Table.Columns.name,
          Cell: ({ row }: { row: Row<DocumentWithRelationshipLabels> }) => {
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
          Header: 'Content',
          Cell: ({ row }: { row: Row<Document> }) => {
            return (
              <DocumentContentPreview document={row.original} query={query} />
            );
          },
        },
        {
          id: 'author',
          Header: 'Author',
          Cell: ({ row }: { row: Row<Document> }) => {
            return <Body level={2}>{row.original.author}</Body>;
          },
        },
        Table.Columns.mimeType,
        {
          id: 'modifiedTime',
          Header: 'Last updated',
          Cell: ({ row }: { row: Row<Document> }) => (
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
          Header: 'Root asset',
          Cell: ({ row }: { row: Row<Document> }) => {
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
          },
        },
        Table.Columns.externalId,
        Table.Columns.id,
        /**
         * It's not yet known what the other columns will be
         * */
        // Table.Columns.created,
        // Table.Columns.dataSet,
        // Table.Columns.source,
        // Table.Columns.assets,
        // Table.Columns.labels,
      ] as Column<Document>[],
    [query, sdk]
  );

  // const updatedColumns =
  //   getNewColumnsWithRelationshipLabels<DocumentWithRelationshipLabels>(
  //     columns,
  //     relatedResourceType === 'relationship'
  //   );

  return (
    <Table
      {...props}
      columns={columns}
      data={props.data}
      visibleColumns={[
        'name',
        'content',
        'mimeType',
        'modifiedTime',
        'createdTime',
        'rootAsset',
      ]}
    />
  );
};
