import React from 'react';

import { WhiteLoader } from 'components/loading';
import { Table } from 'components/tablev2';
import { useOverviewData } from 'modules/wellSearch/selectors/sequence/useOverviewData';
import { useOverviewResultColumns } from 'pages/authorized/search/well/inspect/modules/overview/hooks/useOverviewUtils';

import { OverviewModel } from './types';

export const columns = useOverviewResultColumns();

export const OverviewComponent: React.FC<{
  overviewData: OverviewModel[];
}> = ({ overviewData }) => {
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
