import { Table } from '@cognite/cogs.js';
import { TableCell } from 'components/table/TableCell';

export const curateColumns = () => {
  return [
    {
      Header: 'Label',
      accessor: 'name',
      Filter: Table.InputFilter(),
      filter: 'fuzzyText',
      filterIcon: 'Search',
      Cell: TableCell.Label(),
    },
    // Toggle showing external id
    // {
    //   Header: 'External Id',
    //   accessor: 'externalId',
    //   Cell: TableCell.Text(),
    // },
    {
      Header: 'Description',
      accessor: 'description',
      Cell: TableCell.Text(),
    },
    {
      Header: 'Created',
      accessor: 'createdTime',
      Cell: TableCell.Date,
    },
  ];
};
