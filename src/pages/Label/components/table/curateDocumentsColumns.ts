import { Table } from '@cognite/cogs.js';
import { TableCell } from 'src/components/table/TableCell';

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
      Cell: TableCell.Text({ strong: true }),
    },
    {
      Header: 'Created',
      accessor: 'sourceFile.createdTime',
      Cell: TableCell.Date,
    },
    {
      Header: 'Updated',
      accessor: 'sourceFile.lastUpdatedTime',
      Cell: TableCell.Date,
    },
    {
      Header: 'Source',
      accessor: 'sourceFile.source',
      Cell: TableCell.Text(),
    },
    {
      Header: 'Format',
      accessor: 'type',
      Cell: TableCell.Text(),
    },
    {
      Header: 'Author',
      accessor: 'author',
      Cell: TableCell.Text(),
    },
    {
      Header: 'Title',
      accessor: 'title',
      Cell: TableCell.Text(),
    },
    {
      Header: '',
      accessor: 'preview',
      disableSortBy: true,
      Cell: TableCell.PreviewDocumentButton(toggleDocumentPreview),
    },
  ];
};
