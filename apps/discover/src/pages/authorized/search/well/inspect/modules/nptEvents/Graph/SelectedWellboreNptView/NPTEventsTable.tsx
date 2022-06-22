import React from 'react';

import { Table } from 'components/Tablev3';

import { PAGE_SIZE } from '../../Table/constants';
import { useSelectedWellboreNptEventsTableColumns } from '../../Table/hooks/useHelpers';
import { NptView } from '../../types';

import { NPTEventsTableWrapper } from './elements';

interface NPTEventsTableProps {
  data: NptView[];
}

export const NPTEventsTable: React.FC<NPTEventsTableProps> = React.memo(
  ({ data }) => {
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
        <Table<NptView>
          scrollTable
          id="npt-events-table"
          data={data}
          columns={nptEventsTableColumns}
          options={tableOptions}
        />
      </NPTEventsTableWrapper>
    );
  }
);
