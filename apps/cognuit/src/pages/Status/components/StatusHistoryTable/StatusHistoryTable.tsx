import { Table } from '@cognite/cogs.js';
import React from 'react';
import { statusConfig } from 'configs/status.config';
import { useHeartbeatsOutagesReportQuery } from 'services/endpoints/sources/query';
import { HeartbeatsOutages } from 'pages/Status/types';
import LoadingBox from 'components/Molecules/LoadingBox';

import { EmptyTable } from './EmptyTable';
import { curateColumns } from './curateColumns';

const columns = curateColumns();

const emptyText = <EmptyTable />;

export const StatusHistoryTable: React.FC = () => {
  const { data, isLoading } = useHeartbeatsOutagesReportQuery(
    statusConfig.connectors
  );

  if (isLoading) {
    return <LoadingBox backgroundColor="white" textColor="black" />;
  }

  return (
    <Table<HeartbeatsOutages & { id: number }>
      pagination={false}
      columns={columns as any}
      dataSource={data as any}
      locale={{ emptyText }}
    />
  );
};
