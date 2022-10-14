import React from 'react';

import { NewTable as Table, TableProps } from 'components/ReactTable/Table';

import { DocumentNamePreview } from './DocumentNamePreview';
import { DocumentContentPreview } from './DocumentContentPreview';
import { Column, Row } from 'react-table';
import { Document } from 'domain/documents';
import { Body, Flex, Button } from '@cognite/cogs.js';
import { useQuery } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';
import { getRootAsset } from 'utils';
import { Asset } from '@cognite/sdk';

// TODO: Might need to add RelationshipLabels at some point.
export type DocumentTableProps = Omit<
  TableProps<DocumentWithRelationshipLabels>,
  'columns'
> & {
  query?: string;
  onRootAssetClick: (asset: Asset) => void;
};
export type DocumentWithRelationshipLabels = Document;

export const DocumentsTable = (props: DocumentTableProps) => {
  const { query, onRootAssetClick } = props;
  const sdk = useSDK();

  const columns = [
    {
      ...Table.Columns.name,
      Cell: ({ row }: { row: Row<DocumentWithRelationshipLabels> }) => {
        const fileNamePreviewProps = {
          fileName: row.original.name || '',
          file: row.original,
        };
        return <DocumentNamePreview {...fileNamePreviewProps} query={query} />;
      },
    },
    {
      id: 'content',
      Header: 'Content',
      Cell: ({ row }: { row: Row<Document> }) => {
        return <DocumentContentPreview document={row.original} query={query} />;
      },
    },
    Table.Columns.mimeType,
    Table.Columns.lastUpdatedTime,
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
            <Body level={2}>
              <Flex alignItems="center">
                <Button
                  type="link"
                  icon="ArrowRight"
                  iconPlacement="right"
                  style={{ color: 'inherit' }}
                  onClick={e => {
                    e.stopPropagation();
                    onRootAssetClick(rootAsset);
                  }}
                >
                  {rootAsset?.name}
                </Button>
              </Flex>
            </Body>
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
  ] as Column<DocumentWithRelationshipLabels>[];

  // const updatedColumns =
  //   getNewColumnsWithRelationshipLabels<DocumentWithRelationshipLabels>(
  //     columns,
  //     relatedResourceType === 'relationship'
  //   );

  return (
    <Table<DocumentWithRelationshipLabels>
      {...props}
      columns={columns}
      data={props.data}
      visibleColumns={[
        'name',
        'content',
        'mimeType',
        'lastUpdatedTime',
        'createdTime',
        'rootAsset',
      ]}
    />
  );
};
