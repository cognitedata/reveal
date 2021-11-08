import { TableCell } from 'components/TableCell';
import { Column } from 'react-table';

export const curateColumns = (labels: string[]) => {
  return labels.reduce(
    (accumulator, label) => {
      return [
        ...accumulator,
        {
          Header: label,
          accessor: `matrix.${label}.value`,
          disableSortBy: true,
          Cell: TableCell.MatrixLabel(label),
        },
      ];
    },
    [
      { Header: '', accessor: 'name', Cell: TableCell.Text({ strong: true }) },
    ] as Column<any>[]
  );
};
