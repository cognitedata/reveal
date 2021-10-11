import React from 'react';

import { Table } from 'components/tablev2';
import { NPTEvent } from 'modules/wellSearch/types';

import { nptEventsTableColumns } from './columns';
import { PAGE_SIZE } from './constants';
import { NptEventsTableWrapper } from './elements';

export const NptEventsTable: React.FC<{ events: NPTEvent[] }> = ({
  events,
}) => {
  const tableOptions = {
    flex: false,
    pagination: {
      enabled: true,
      pageSize: PAGE_SIZE,
    },
  };

  return (
    <NptEventsTableWrapper>
      <Table<NPTEvent>
        id="npt-events-table"
        data={events || []}
        columns={nptEventsTableColumns}
        options={tableOptions}
      />
    </NptEventsTableWrapper>
  );
};
