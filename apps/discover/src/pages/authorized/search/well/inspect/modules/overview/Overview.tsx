import React from 'react';

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

  return <OverviewComponent overviewData={overviewData} />;
};

export default Overview;
