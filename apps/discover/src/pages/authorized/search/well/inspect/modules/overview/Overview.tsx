import React, { useState } from 'react';

import get from 'lodash/get';

import { shortDate } from '_helpers/date';
import { sortDates } from '_helpers/dateConversion';
import { WhiteLoader } from 'components/loading';
import { Table } from 'components/tablev2';
import { ColumnType } from 'components/tablev3';
import { FEET } from 'constants/units';
import { useOverviewData } from 'modules/wellSearch/selectors/sequence/useOverviewData';

import { WATER_DEPTH } from '../../../content/constants';

import { OverviewModel } from './types';

export const OverviewComponent: React.FC<{
  overviewData: OverviewModel[];
}> = ({ overviewData }) => {
  const [columns] = useState<ColumnType<OverviewModel>[]>([
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
      Header: `${WATER_DEPTH} (${FEET})`,
      accessor: 'waterDepth.value',
      width: 'auto',
    },
    {
      Header: `TVD (${FEET})`,
      accessor: (row) => row.tvd || '',
      width: 'auto',
    },
    {
      Header: `MD (${FEET})`,
      accessor: (row) => row.md || '',
      width: 'auto',
    },
  ]);

  const options = {
    checkable: false,
    expandable: false,
    flex: false,
    height: '100%',
  };

  return (
    <Table<OverviewModel>
      scrollTable
      id="overview-result-table"
      data={overviewData}
      columns={columns}
      options={options}
    />
  );
};

export const Overview: React.FC = () => {
  const { isLoading, overviewData } = useOverviewData();

  if (isLoading) {
    return <WhiteLoader />;
  }

  return <OverviewComponent overviewData={overviewData} />;
};

export default Overview;
