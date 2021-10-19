import React from 'react';

import { Table } from 'components/tablev2';
import { useNPTGraphSelectedWellboreData } from 'modules/wellInspect/selectors';
import { NPTEvent } from 'modules/wellSearch/types';

import { PAGE_SIZE } from '../../table/constants';
import { useNptEventsTableColumns } from '../../table/hooks/useHelpers';

import { NPTEventsTableWrapper } from './elements';

export const NPTEventsTable: React.FC = () => {
  const selectedWellboreData = useNPTGraphSelectedWellboreData();
  const nptEventsTableColumns = useNptEventsTableColumns(true);

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
        id="npt-events-table"
        data={selectedWellboreData.data}
        columns={nptEventsTableColumns}
        options={tableOptions}
      />
    </NPTEventsTableWrapper>
  );
};
