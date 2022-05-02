import React from 'react';

import { Table } from 'components/Tablev3';
import { NPTEvent } from 'modules/wellSearch/types';

import { PAGE_SIZE } from '../../table/constants';
import { useSelectedWellboreNptEventsTableColumns } from '../../table/hooks/useHelpers';

import { NPTEventsTableWrapper } from './elements';

export const NPTEventsTable: React.FC<{ events: NPTEvent[] }> = React.memo(
  ({ events }) => {
    const nptEventsTableColumns = useSelectedWellboreNptEventsTableColumns();

    const tableOptions = {
      flex: false,
      pagination: {
        enabled: true,
        pageSize: PAGE_SIZE,
      },
    };

    return (
      <NPTEventsTableWrapper>
        <Table<NPTEvent>
          scrollTable
          id="npt-events-table"
          data={events}
          columns={nptEventsTableColumns}
          options={tableOptions}
        />
      </NPTEventsTableWrapper>
    );
  }
);
