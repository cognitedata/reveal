import { Table } from '@cognite/cogs.js';
import { Navigation } from 'hooks/useNavigation';
import { TableCell } from 'components/TableCell';

export const curateColumns = (navigate: Navigation) => {
  return [
    {
      Header: 'Label',
      accessor: 'id',
      Filter: Table.InputFilter(),
      filter: 'fuzzyText',
      filterIcon: 'Search',
      disableSortBy: true,
      Cell: TableCell.Label(),
    },
    {
      Header: 'Description',
      accessor: 'description',
      Cell: TableCell.Text(),
    },
    {
      Header: 'Files in label',
      accessor: 'count',
      Cell: TableCell.Tag,
    },
    {
      Header: '',
      accessor: 'settings',
      Cell: TableCell.ManageFilesButton(navigate),
    },
  ];
};
