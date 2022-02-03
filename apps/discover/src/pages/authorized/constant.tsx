import { getDateOrDefaultText } from 'utils/date';
import { sortDates } from 'utils/sortDates';

import { MiddleEllipsis } from 'components/middle-ellipsis/MiddleEllipsis';
import { DEFAULT_PAGE_SIZE } from 'constants/app';
import { FEET } from 'constants/units';
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
  WELLBORE,
} from './search/well/content/constants';

export const wellColumns: ColumnMap<Well> = {
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
    Header: `${WATER_DEPTH} (${FEET})`,
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
};

export const WellResultTableOptions = {
  expandable: true,
  checkable: true,
  flex: false,
  hideScrollbars: true,
  pagination: {
    enabled: true,
    pageSize: DEFAULT_PAGE_SIZE,
  },
  rowOptions: {
    hoveredStyle: 'var(--cogs-greyscale-grey1)',
  },
};

export const WellboreSubtableOptions = {
  checkable: true,
  hideScrollbars: true,
  hideBorders: true,
  indentRow: true,
  disableSorting: true,
  flex: false,
  rowOptions: {
    hoveredStyle: 'var(--cogs-greyscale-grey1)',
  },
};

export const WellboreColumns = [
  {
    Header: WELLBORE,
    accessor: 'description',
    width: '100px',
    maxWidth: '1fr',
  },
];
