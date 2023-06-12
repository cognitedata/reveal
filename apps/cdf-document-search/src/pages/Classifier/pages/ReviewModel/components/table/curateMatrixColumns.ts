import { Column } from 'react-table';

import { ExternalLabelDefinition } from '@cognite/sdk';
import { TableCell } from '../../../../../../components/table/TableCell';

export const curateColumns = (labels: ExternalLabelDefinition[]) => {
  return labels.reduce(
    (accumulator, label) => {
      return [
        ...accumulator,
        {
          Header: label.name,
          accessor: `matrix.${label.externalId}.value`,
          disableSortBy: true,
          Cell: TableCell.MatrixLabel(label.externalId),
        },
      ];
    },
    [
      {
        Header: '',
        accessor: 'name',
        Cell: TableCell.Text({ strong: true }),
      },
    ] as Column<any>[]
  );
};
