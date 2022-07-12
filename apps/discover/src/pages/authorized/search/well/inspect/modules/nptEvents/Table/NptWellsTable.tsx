import { sortNptEvents } from 'domain/wells/npt/internal/transformers/sortNptEvents';
import { NptView } from 'domain/wells/npt/internal/types';
import { groupByWellName } from 'domain/wells/well/internal/transformers/groupByWellName';

import React, { useState } from 'react';
import { Row } from 'react-table';

import isEmpty from 'lodash/isEmpty';

import EmptyState from 'components/EmptyState';
import { Table, TableResults } from 'components/Tablev3';
import { useDeepCallback, useDeepEffect } from 'hooks/useDeep';
import { SortBy } from 'pages/types';

import { PAGE_SIZE } from './constants';
import { WellNptEventsTableWrapper } from './elements';
import { useNptWellsTableColumns } from './hooks/useHelpers';
import { NptWellboresTable } from './NptWellboresTable';
import { NptWell } from './types';

interface NptWellsTableProps {
  data: NptView[];
}

export const NptWellsTable: React.FC<NptWellsTableProps> = ({ data }) => {
  const [wells, setWells] = useState<NptWell[]>([]);
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
    const groupedData = groupByWellName(data);
    const wells = Object.keys(groupedData).map((wellName) => ({
      id: wellName,
      wellName,
      data: groupedData[wellName],
    }));

    setWells(wells);
    setSortBy([]);
  }, [data]);

  useDeepEffect(() => {
    if (isEmpty(wells)) return;

    setExpandedWells({
      ...expandedWells,
      [wells[0].id]: true,
    });
  }, [wells]);

  const handleRowClick = useDeepCallback(
    (row: Row) => {
      const { id } = row.original as NptWell;

      setExpandedWells({
        ...expandedWells,
        [id]: !expandedWells[id],
      });
    },
    [expandedWells]
  );

  const renderRowSubComponent = useDeepCallback(
    ({ row, sortBy }) => {
      const { data } = row.original as NptWell;
      const sortedData = sortNptEvents(data, sortBy);
      return <NptWellboresTable data={sortedData} />;
    },
    [wells]
  );

  if (isEmpty(wells)) {
    return <EmptyState />;
  }

  return (
    <WellNptEventsTableWrapper>
      <Table<NptWell>
        scrollTable
        id="npt-table-wells"
        data={wells || []}
        columns={nptWellsTableColumns}
        options={tableOptions}
        renderRowSubComponent={renderRowSubComponent}
        expandedIds={expandedWells}
        handleRowClick={handleRowClick}
      />
    </WellNptEventsTableWrapper>
  );
};
