import { TableCell } from 'components/TableCell';

export const curateColumns = () => {
  return [
    {
      Header: 'Status',
      accessor: 'status',
      Cell: TableCell.Label(),
    },
    {
      Header: 'Active',
      accessor: 'active',
      Cell: TableCell.Text(),
    },
    {
      Header: 'Build time',
      accessor: 'createdAt',
      Cell: TableCell.DateTime,
    },
    {
      Header: 'Labels',
      accessor: 'metrics.labels.length',
      Cell: TableCell.Text(),
    },
    {
      Header: 'Accuracy',
      accessor: 'metrics.recall',
      Cell: TableCell.Number,
    },
    {
      Header: 'F1 score',
      accessor: 'metrics.f1Score',
      Cell: TableCell.Number,
    },
    {
      Header: 'Precision',
      accessor: 'metrics.precision',
      Cell: TableCell.Number,
    },
  ];
};
