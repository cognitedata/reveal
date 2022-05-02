import React, { useCallback, useState } from 'react';
import { Row } from 'react-table';

import get from 'lodash/get';
import groupBy from 'lodash/groupBy';
import isEmpty from 'lodash/isEmpty';

import EmptyState from 'components/EmptyState';
import { Table, TableResults } from 'components/Tablev3';
import { useDeepEffect } from 'hooks/useDeep';
import { NPTEvent } from 'modules/wellSearch/types';
import { SortBy } from 'pages/types';

import { accessors } from '../constants';

import { PAGE_SIZE } from './constants';
import { WellNptEventsTableWrapper } from './elements';
import { useNptWellsTableColumns } from './hooks/useHelpers';
import { NptWellboresTable } from './NptWellboresTable';
import { NPTWell } from './types';
import { sortEvents } from './utils';

export const NptWellsTable: React.FC<{ events: NPTEvent[] }> = ({ events }) => {
  const [wells, setWells] = useState<NPTWell[]>([]);
  const [expandedWells, setExpandedWells] = useState<TableResults>({});
  const [sortBy, setSortBy] = useState<SortBy[]>([]);

  const nptWellsTableColumns = useNptWellsTableColumns();

  const tableOptions = {
    expandable: true,
    flex: false,
    manualSortBy: true,
    sortBy,
    pagination: {
      enabled: true,
      pageSize: PAGE_SIZE,
    },
  };

  useDeepEffect(() => {
    const groupedWellbores = groupBy(events, accessors.WELL_NAME);
    const wells = Object.keys(groupedWellbores).map((wellName) => ({
      id: wellName,
      wellName,
      events: get(groupedWellbores, wellName),
    }));

    setWells(wells);
    setSortBy([]);
  }, [events]);

  useDeepEffect(() => {
    if (isEmpty(wells)) return;

    setExpandedWells({
      ...expandedWells,
      [wells[0].id]: true,
    });
  }, [wells]);

  const handleRowClick = useCallback(
    (row: Row) => {
      const { id } = row.original as NPTWell;

      setExpandedWells({
        ...expandedWells,
        [id]: !expandedWells[id],
      });
    },
    [expandedWells]
  );

  const renderRowSubComponent = useCallback(
    ({ row }) => {
      const { events } = row.original as NPTWell;
      return <NptWellboresTable events={events} />;
    },
    [wells]
  );

  const handleSort = useCallback(
    (sortBy: SortBy[]) => {
      const sorted = wells.map((well) => ({
        ...well,
        events: sortEvents(well.events, sortBy),
      }));

      setWells(sorted);
    },
    [wells]
  );

  if (isEmpty(wells)) {
    return <EmptyState />;
  }

  return (
    <WellNptEventsTableWrapper>
      <Table<NPTWell>
        scrollTable
        id="npt-table-wells"
        data={wells || []}
        columns={nptWellsTableColumns}
        options={tableOptions}
        renderRowSubComponent={renderRowSubComponent}
        expandedIds={expandedWells}
        handleRowClick={handleRowClick}
        handleSort={handleSort}
      />
    </WellNptEventsTableWrapper>
  );
};
