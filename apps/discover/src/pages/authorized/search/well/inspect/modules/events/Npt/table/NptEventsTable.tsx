import React from 'react';

import { Options, Table } from 'components/tablev3';
import { NPTEvent } from 'modules/wellSearch/types';

import { PAGE_SIZE } from './constants';
import { useNptEventsTableColumns } from './hooks/useHelpers';

export const NptEventsTable: React.FC<{ events: NPTEvent[] }> = ({
  events,
}) => {
  const nptEventsTableColumns = useNptEventsTableColumns();

  const tableOptions: Options = {
    flex: false,
    pagination: {
      enabled: true,
      pageSize: PAGE_SIZE,
    },
    hideScrollbars: true,
  };

  return (
    <Table<NPTEvent>
      id="npt-events-table"
      data={events || []}
      columns={nptEventsTableColumns}
      options={tableOptions}
      indent="60px"
      hideHeaders
    />
  );
};
