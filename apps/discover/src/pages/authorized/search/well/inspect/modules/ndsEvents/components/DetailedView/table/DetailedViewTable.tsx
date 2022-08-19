import * as React from 'react';

import { Table } from 'components/Tablev3';

import { NdsView } from '../../../types';
import { useNdsTableCommonColumns } from '../../Table/columns/useNdsTableColumns';

import { DetailedViewTableWrapper } from './elements';
import { DetailedViewTableProps } from './types';

export const DetailedViewTable: React.FC<DetailedViewTableProps> = ({
  data,
}) => {
  const columns = useNdsTableCommonColumns();

  const tableOptions = {
    flex: false,
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
