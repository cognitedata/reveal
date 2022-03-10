import { ExternalId } from '@cognite/sdk';
import { Table } from '@cognite/cogs.js';
import { TableCell } from 'src/components/table/TableCell';

export const curateColumns = (deleteLabels: (ids: ExternalId[]) => void) => {
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
      accessor: 'deleteLabelAction',
      Cell: TableCell.DeleteLabelButton(deleteLabels),
    },
  ];
};
