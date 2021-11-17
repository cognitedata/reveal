import React, { useState } from 'react';
import { Flex, Loader } from '@cognite/cogs.js';
import { useTableData } from 'hooks/table-data';
import { FilterBar } from './FilterBar';
import { Table } from './Table';

export const Spreadsheet = (): JSX.Element => {
  const { rows, columns, isLoading, isFetched } = useTableData();
  const [columnQuery, setColumnQuery] = useState('');

  const isEmpty = isFetched && !rows?.length;

  const filteredColumns = [
    ...columns.slice(0, 1),
    ...columns
      .slice(1)
      .filter((column) =>
        column.title.toLowerCase().includes(columnQuery.toLowerCase())
      ),
  ];

  return (
    <Flex direction="column" style={{ width: '100%', height: '100%' }}>
      <FilterBar
        isEmpty={isEmpty}
        columnQuery={columnQuery}
        setColumnQuery={setColumnQuery}
      />
      {isLoading ? (
        <Loader />
      ) : (
        <Table isEmpty={isEmpty} rows={rows} columns={filteredColumns} />
      )}
    </Flex>
  );
};
