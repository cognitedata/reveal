import React from 'react';

import { Table } from 'components/Tablev3';

import { useNdsTableCommonColumns } from '../../table/columns/useNdsTableColumns';
import { NdsView } from '../../types';

import { DetailedViewTableWrapper } from './elements';
import { DetailedViewTableProps } from './types';

export const DetailedViewTable: React.FC<DetailedViewTableProps> = ({
  data,
}) => {
  const columns = useNdsTableCommonColumns();

  const tableOptions = {
    flex: false,
    pagination: {
      enabled: true,
      pageSize: 50,
    },
  };

  return (
    <DetailedViewTableWrapper>
      <Table<Partial<NdsView>>
        scrollTable
        id="nds-detailed-view-table"
        data={data}
        columns={columns}
        options={tableOptions}
      />
    </DetailedViewTableWrapper>
  );
};
