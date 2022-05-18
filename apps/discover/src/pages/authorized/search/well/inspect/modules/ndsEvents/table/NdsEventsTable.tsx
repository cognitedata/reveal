import React from 'react';

import { Table } from 'components/Tablev3';

import { NdsView } from '../types';

import { useNdsWellboresTableColumns } from './columns/useNdsTableColumns';
import { NdsTableProps } from './types';

export const NdsEventsTable: React.FC<NdsTableProps> = ({ data }) => {
  const columns = useNdsWellboresTableColumns();

  const tableOptions = {
    flex: false,
    pagination: {
      enabled: true,
      pageSize: 50,
    },
  };

  return (
    <Table<Partial<NdsView>>
      scrollTable
      indent
      hideHeaders
      id="nds-events-table"
      data={data}
      columns={columns}
      options={tableOptions}
    />
  );
};
