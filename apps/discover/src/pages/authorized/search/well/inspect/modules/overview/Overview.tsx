import React from 'react';

import isEmpty from 'lodash/isEmpty';

import EmptyState from 'components/emptyState';
import { Loading } from 'components/loading/Loading';
import { Table } from 'components/tablev3';
import { useOverviewData } from 'modules/wellSearch/selectors/sequence/useOverviewData';

import { useOverviewResultColumns } from './hooks/useOverviewUtils';
import { OverviewModel } from './types';

export const OverviewComponent: React.FC<{
  overviewData: OverviewModel[];
}> = ({ overviewData }) => {
  const columns = useOverviewResultColumns();
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
    return <Loading />;
  }

  if (isEmpty(overviewData)) {
    return <EmptyState />;
  }

  return <OverviewComponent overviewData={overviewData} />;
};

export default Overview;
