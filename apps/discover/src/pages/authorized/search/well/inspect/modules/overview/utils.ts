import { getSpudDateDisplay } from 'dataLayers/wells/wells/selectors/getSpudDateDisplay';
import { getSpudDateTableSort } from 'dataLayers/wells/wells/selectors/getSpudDateSort';
import { wellFieldTitles } from 'dataLayers/wells/wells/titles';

import { ColumnType } from 'components/tablev3';
import { WATER_DEPTH } from 'pages/authorized/search/well/content/constants';

import { OverviewModel } from './types';

export const generateOverviewColumns = (
  preferredUnit?: string
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
      Header: wellFieldTitles.spudDate,
      accessor: getSpudDateDisplay,
      sortType: getSpudDateTableSort,
      maxWidth: '0.15fr',
      width: '100px',
    },
    {
      Header: `${WATER_DEPTH}${preferredUnit ? ` (${preferredUnit})` : ''}`,
      accessor: 'waterDepth.value',
      maxWidth: '0.15fr',
      width: '100px',
    },
    {
      Header: `TVD${preferredUnit ? ` (${preferredUnit})` : ''}`,
      accessor: (row) => row.tvd || '',
      maxWidth: '0.15fr',
      width: '100px',
    },
    {
      Header: `MD${preferredUnit ? ` (${preferredUnit})` : ''}`,
      accessor: (row) => row.md || '',
      maxWidth: '0.15fr',
      width: '100px',
    },
  ];
  return columns;
};
