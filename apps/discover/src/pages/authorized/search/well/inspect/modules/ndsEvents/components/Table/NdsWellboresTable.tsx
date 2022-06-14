import React from 'react';

import { ViewButton } from 'components/Buttons';
import { Table } from 'components/Tablev3';

import { NdsView } from '../../types';

import { useNdsWellboresTableColumns } from './columns/useNdsTableColumns';
import { NdsTableProps } from './types';

export const NdsWellboresTable: React.FC<NdsTableProps> = ({
  data,
  onClickView,
}) => {
  const columns = useNdsWellboresTableColumns();

  const tableOptions = {
    flex: false,
    pagination: {
      enabled: true,
      pageSize: 50,
    },
  };

  const renderRowHoverComponent = () => {
    return <ViewButton hideIcon onClick={() => onClickView(data)} />;
  };

  return (
    <Table<Partial<NdsView>>
      scrollTable
      indent
      hideHeaders
      id="nds-wellbores-table"
      data={data}
      columns={columns}
      options={tableOptions}
      renderRowHoverComponent={renderRowHoverComponent}
    />
  );
};
