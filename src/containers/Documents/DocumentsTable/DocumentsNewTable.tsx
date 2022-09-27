import React from 'react';

import { NewTable as Table, TableProps } from 'components/ReactTable/Table';

import { DocumentNamePreview } from './DocumentNamePreview';
import { Column, Row } from 'react-table';
import { Document } from 'types';
import { Body, A, Flex } from '@cognite/cogs.js';
import { useQuery } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';
import { getRootAsset } from '../../../utils/assets';

export type DocumentTableProps = TableProps<DocumentWithRelationshipLabels>; /*&
  RelationshipLabels & {
    query?: string;
  };*/
export type DocumentWithRelationshipLabels =
  /*RelationshipLabels &*/
  Document;
export const DocumentsTable = (props: DocumentTableProps) => {
  // const { relatedResourceType, query } = props;
  const sdk = useSDK();

  const columns = [
    {
      ...Table.Columns.name,
      Cell: ({ row }: { row: Row<DocumentWithRelationshipLabels> }) => {
        const fileNamePreviewProps = {
          fileName: row.original.name || '',
          file: row.original,
        };
        return <DocumentNamePreview {...fileNamePreviewProps} query={''} />;
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

        return (
          <Body level={2}>
            <Flex alignItems="center">
              <A
                href="https://cognite.com" // this is a placeholder, don't know where it should go
                rel="noopener noreferrer"
                target="_blank"
                isExternal={true}
              >
                {rootAsset?.name}
              </A>
            </Flex>
          </Body>
        );
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
      columns={columns}
      data={props.data}
      visibleColumns={[
        'name',
        'mimeType',
        'lastUpdatedTime',
        'createdTime',
        'rootAsset',
      ]}
    />
  );
};
