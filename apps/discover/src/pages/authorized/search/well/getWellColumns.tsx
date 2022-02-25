import { getDateOrDefaultText } from 'utils/date';
import { sortByDate } from 'utils/sort/sortByDate';

import { MiddleEllipsis } from 'components/middle-ellipsis/MiddleEllipsis';
import { ColumnMap } from 'modules/documentSearch/utils/columns';
import { Well } from 'modules/wellSearch/types';

import {
  BLOCK_NAME,
  FIELD_NAME,
  OPERATOR,
  SOURCE,
  SPUD_DATE,
  WATER_DEPTH,
  WELL,
} from './content/constants';

export type Field = {
  enabled: boolean;
};

export const getWellColumns = (userPreferredUnit = ''): ColumnMap<Well> => {
  return {
    wellname: {
      Header: WELL,
      accessor: 'name',
      width: '250px',
      maxWidth: '0.6fr',
      Cell: (cell) => <MiddleEllipsis value={cell.row.original.name} />,
      order: 0,
    },
    source: {
      Header: SOURCE,
      accessor: (value: Well) =>
        value.sources ? value.sources.join(', ') : '',
      width: '150px',
      order: 6,
    },
    operator: {
      Header: OPERATOR,
      accessor: 'operator',
      width: '150px',
      maxWidth: '0.4fr',
      order: 2,
    },
    spudDate: {
      Header: SPUD_DATE,
      accessor: (row) => getDateOrDefaultText(row.spudDate),
      sortType: (rowA, rowB) => {
        return sortByDate(rowA.original.spudDate, rowB.original.spudDate);
      },
      width: '140px',
      order: 3,
    },
    waterDepth: {
      Header: `${WATER_DEPTH} (${userPreferredUnit})`,
      accessor: 'waterDepth.value',
      width: '170px',
      order: 4,
    },
    blockname: {
      Header: BLOCK_NAME,
      accessor: 'block',
      width: '150px',
      order: 5,
    },
    fieldname: {
      Header: FIELD_NAME,
      accessor: 'field',
      width: '150px',
      order: 1,
    },
  };
};
