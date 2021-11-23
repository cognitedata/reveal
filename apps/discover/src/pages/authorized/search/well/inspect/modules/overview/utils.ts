import get from 'lodash/get';

import { shortDate } from '_helpers/date';
import { sortDates } from '_helpers/dateConversion';
import { ColumnType } from 'components/tablev3';
import { WATER_DEPTH } from 'pages/authorized/search/well/content/constants';

import { OverviewModel } from './types';

export const generateOverviewColumns = (
  userPrefferedUnit: string
): ColumnType<OverviewModel>[] => {
  const columns: ColumnType<OverviewModel>[] = [
    {
      Header: 'Well',
      accessor: 'wellName',
      width: '350px',
    },
    {
      Header: 'Field',
      accessor: 'field',
      width: 'auto',
    },
    {
      Header: 'Source',
      accessor: (value: OverviewModel) =>
        value.sources ? value.sources.join(', ') : '',
      width: 'auto',
    },
    {
      Header: 'Operator',
      accessor: 'operator',
      width: 'auto',
    },
    {
      Header: 'Spud Date',
      accessor: (row) => shortDate(row.spudDate),
      sortType: (rowA, rowB) => {
        const date1 = get(rowA, 'original.spudDate', '');
        const date2 = get(rowB, 'original.spudDate', '');

        return sortDates(date1, date2);
      },
      width: 'auto',
    },
    {
      Header: `${WATER_DEPTH} (${userPrefferedUnit})`,
      accessor: 'waterDepth.value',
      width: 'auto',
    },
    {
      Header: `TVD (${userPrefferedUnit})`,
      accessor: (row) => row.tvd || '',
      width: 'auto',
    },
    {
      Header: `MD (${userPrefferedUnit})`,
      accessor: (row) => row.md || '',
      width: 'auto',
    },
  ];
  return columns;
};
