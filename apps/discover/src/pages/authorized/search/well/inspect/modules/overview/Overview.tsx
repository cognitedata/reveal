import * as React from 'react';

import isEmpty from 'lodash/isEmpty';

import EmptyState from 'components/EmptyState';
import { Loading } from 'components/Loading/Loading';
import { Table } from 'components/Tablev3';

import { useOverviewResultColumns } from './hooks/useOverviewUtils';
import { OverviewModel } from './types';
import { useDataLayer } from './useDataLayer';

const options = {
  checkable: false,
  expandable: false,
  flex: false,
  height: '100%',
};

export const OverviewComponent: React.FC<{
  overviewData: OverviewModel[];
}> = ({ overviewData }) => {
  const columns = useOverviewResultColumns();

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
  const { isLoading, overviewData } = useDataLayer();

  if (isLoading) {
    return <Loading />;
  }

  if (isEmpty(overviewData)) {
    return <EmptyState />;
  }

  return <OverviewComponent overviewData={overviewData} />;
};

export default Overview;
