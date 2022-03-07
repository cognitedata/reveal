import { Table } from '@cognite/cogs.js';
import { TableCell } from 'src/components/table/TableCell';
import { Navigation } from 'src/hooks/useNavigation';

export const curateColumns = ({ navigate }: { navigate: Navigation }) => {
  return [
    {
      Header: 'Label',
      accessor: 'name',
      Filter: Table.InputFilter(),
      filter: 'fuzzyText',
      filterIcon: 'Search',
      Cell: TableCell.Label(),
    },
    {
      Header: 'External Id',
      accessor: 'externalId',
      Cell: TableCell.Text(),
    },
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
    {
      Header: '',
      accessor: 'viewLabelAction',
      Cell: TableCell.ViewLabelButton(navigate),
    },
  ];
};
