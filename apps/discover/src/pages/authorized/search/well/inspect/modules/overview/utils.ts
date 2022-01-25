import get from 'lodash/get';
import { getDateOrDefaultText } from 'utils/date';
import { sortDates } from 'utils/sortDates';

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
      width: '100px',
      maxWidth: '0.2fr',
    },
    {
      Header: 'Source',
      accessor: (value: OverviewModel) =>
        value.sources ? value.sources.join(', ') : '',
      width: '100px',
      maxWidth: '0.2fr',
    },
    {
      Header: 'Operator',
      accessor: 'operator',
      width: '100px',
      maxWidth: '0.2fr',
    },
    {
      Header: 'Spud Date',
      accessor: (row) => getDateOrDefaultText(row.spudDate),
      sortType: (rowA, rowB) => {
        const date1 = get(rowA, 'original.spudDate', '');
        const date2 = get(rowB, 'original.spudDate', '');

        return sortDates(date1, date2);
      },
      maxWidth: '0.15fr',
      width: '100px',
    },
    {
      Header: `${WATER_DEPTH} (${userPrefferedUnit})`,
      accessor: 'waterDepth.value',
      maxWidth: '0.15fr',
      width: '100px',
    },
    {
      Header: `TVD (${userPrefferedUnit})`,
      accessor: (row) => row.tvd || '',
      maxWidth: '0.15fr',
      width: '100px',
    },
    {
      Header: `MD (${userPrefferedUnit})`,
      accessor: (row) => row.md || '',
      maxWidth: '0.15fr',
      width: '100px',
    },
  ];
  return columns;
};
