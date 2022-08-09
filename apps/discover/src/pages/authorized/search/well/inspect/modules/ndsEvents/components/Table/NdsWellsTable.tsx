import { NDS_ACCESSORS } from 'domain/wells/nds/internal/selectors/accessors';

import React, { useState } from 'react';

import groupBy from 'lodash/groupBy';
import head from 'lodash/head';
import { sortTableData } from 'utils/sort/sortTableData';

import { Table, TableResults } from 'components/Tablev3';
import { useDeepCallback, useDeepEffect, useDeepMemo } from 'hooks/useDeep';

import { NdsView } from '../../types';

import { useNdsWellsTableColumns } from './columns/useNdsTableColumns';
import { NdsWellboresTable } from './NdsWellboresTable';
import { NdsWellsTableData, NdsTableProps } from './types';

const tableOptions = {
  expandable: true,
  flex: false,
  pagination: {
    enabled: true,
    pageSize: 50,
  },
};

export const NdsWellsTable: React.FC<NdsTableProps> = ({
  data,
  onClickView,
}) => {
  const columns = useNdsWellsTableColumns();

  const [tableData, setTableData] = useState<NdsWellsTableData[]>([]);
  const [expandedWells, setExpandedWells] = useState<TableResults>({});

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

  const renderRowSubComponent = useDeepCallback(
    ({ row, sortBy }) => {
      const { data } = row.original;
      const tableData = sortTableData<NdsView>(data, sortBy);
      return <NdsWellboresTable data={tableData} onClickView={onClickView} />;
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
      renderRowSubComponent={renderRowSubComponent}
    />
  );
};
