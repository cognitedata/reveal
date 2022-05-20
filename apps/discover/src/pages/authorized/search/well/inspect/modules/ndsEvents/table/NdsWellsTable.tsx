import { NDS_ACCESSORS } from 'domain/wells/dataLayer/nds/selectors/accessors';

import React, { useState } from 'react';

import groupBy from 'lodash/groupBy';
import head from 'lodash/head';

import { Table, TableResults } from 'components/Tablev3';
import { useDeepCallback, useDeepEffect, useDeepMemo } from 'hooks/useDeep';
import { SortBy } from 'pages/types';

import { useNdsWellsTableColumns } from './columns/useNdsTableColumns';
import { NdsWellboresTable } from './NdsWellboresTable';
import { NdsWellsTableData, NdsTableProps } from './types';
import { sortNdsEvents } from './utils';

export const NdsWellsTable: React.FC<NdsTableProps> = ({
  data,
  onClickView,
}) => {
  const columns = useNdsWellsTableColumns();

  const [tableData, setTableData] = useState<NdsWellsTableData[]>([]);
  const [expandedWells, setExpandedWells] = useState<TableResults>({});
  const [sortBy, setSortBy] = useState<SortBy[]>([]);

  const tableOptions = {
    expandable: true,
    flex: false,
    manualSortBy: true,
    sortBy,
    pagination: {
      enabled: true,
      pageSize: 50,
    },
  };

  const groupedData = useDeepMemo(
    () => groupBy(data, NDS_ACCESSORS.WELL_NAME),
    [data]
  );

  useDeepEffect(() => {
    const tableData = Object.keys(groupedData).map((wellName) => ({
      id: wellName,
      wellName,
      data: groupedData[wellName],
    }));
    const firstRow = head(tableData);

    setTableData(tableData);
    setExpandedWells(firstRow ? { [firstRow.id]: true } : {});
    setSortBy([]);
  }, [groupedData]);

  const handleRowClick = useDeepCallback(
    ({ original }) => {
      const { wellName } = original;
      setExpandedWells({
        ...expandedWells,
        [wellName]: !expandedWells[wellName],
      });
    },
    [expandedWells]
  );

  const handleSort = useDeepCallback(
    (sortBy: SortBy[]) => {
      const sortedTableData = tableData.map((row) => ({
        ...row,
        data: sortNdsEvents(row.data, sortBy),
      }));

      setSortBy(sortBy);
      setTableData(sortedTableData);
    },
    [tableData]
  );

  const renderRowSubComponent = useDeepCallback(
    ({ row }) => {
      const { data } = row.original;
      return <NdsWellboresTable data={data} onClickView={onClickView} />;
    },
    [tableData]
  );

  return (
    <Table<NdsWellsTableData>
      scrollTable
      id="nds-wells-table"
      data={tableData}
      columns={columns}
      options={tableOptions}
      expandedIds={expandedWells}
      handleRowClick={handleRowClick}
      handleSort={handleSort}
      renderRowSubComponent={renderRowSubComponent}
    />
  );
};
