import React from 'react';
import { Button, Table, TableProps } from '@cognite/cogs.js';

export const curateColumns = ({
  toggleDocumentPreview,
}: {
  toggleDocumentPreview: (documentId: number) => void;
}) => {
  return [
    {
      Header: 'File name',
      accessor: 'sourceFile.name',
      Filter: Table.InputFilter(),
      filter: 'fuzzyText',
      filterIcon: 'Search',
      disableSortBy: true,
    },
    {
      Header: 'Created',
      accessor: 'sourceFile.createdTime',
    },
    {
      Header: 'Updated',
      accessor: 'sourceFile.lastUpdatedTime',
    },
    {
      Header: 'Source',
      accessor: 'sourceFile.source',
    },
    {
      Header: 'Format',
      accessor: 'type',
    },
    {
      Header: 'Author',
      accessor: 'author',
    },
    {
      Header: 'Title',
      accessor: 'title',
    },
    {
      Header: '',
      accessor: 'preview',
      disableSortBy: true,
      Cell: ({
        row: {
          original: { id },
        },
      }: any) => {
        return (
          <Button
            icon="Document"
            type="secondary"
            onClick={() => toggleDocumentPreview(id)}
          >
            Preview
          </Button>
        );
      },
    },
  ] as TableProps<any>['columns'];
};
