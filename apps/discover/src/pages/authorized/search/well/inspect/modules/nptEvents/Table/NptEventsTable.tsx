import { NptView } from 'domain/wells/npt/internal/types';

import * as React from 'react';

import { Options, Table } from 'components/Tablev3';

import { PAGE_SIZE } from './constants';
import { useNptEventsTableColumns } from './hooks/useHelpers';

interface NptEventsTableProps {
  data: NptView[];
}

const tableOptions: Options = {
  flex: false,
  pagination: {
    enabled: true,
    pageSize: PAGE_SIZE,
  },
  hideScrollbars: true,
};

export const NptEventsTable: React.FC<NptEventsTableProps> = ({ data }) => {
  const nptEventsTableColumns = useNptEventsTableColumns();

  return (
    <Table<NptView>
      id="npt-events-table"
      data={data}
      columns={nptEventsTableColumns}
      options={tableOptions}
      indent="60px"
      hideHeaders
    />
  );
};
