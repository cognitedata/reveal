import { getDateOrDefaultText } from '_helpers/date';
import { sortDates } from '_helpers/sortDates';
import { getMiddleEllipsisWrapper } from 'components/middle-ellipsis/MiddleEllipsis';
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

export const generateWellColumns = (
  userPrefferedUnit: string
): ColumnMap<Well> => ({
  wellname: {
    Header: WELL,
    accessor: 'name',
    width: '250px',
    maxWidth: '0.6fr',
    Cell: (cell) => getMiddleEllipsisWrapper(cell.row.original.name, false),
    order: 0,
  },
  source: {
    Header: SOURCE,
    accessor: (value: Well) => (value.sources ? value.sources.join(', ') : ''),
    width: '150px',
    order: 1,
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
      return sortDates(rowA.original.spudDate, rowB.original.spudDate);
    },
    width: '140px',
    order: 3,
  },
  waterDepth: {
    Header: `${WATER_DEPTH} (${userPrefferedUnit})`,
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
    order: 6,
  },
});
