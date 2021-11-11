import React from 'react';
import { Flex } from '@cognite/cogs.js';
import { Header, FilterBar, Table } from './components';

const TableContent = () => {
  return (
    <Flex direction="column">
      <TableContent.Header />
      <TableContent.FilterBar />
      <TableContent.Table />
    </Flex>
  );
};

TableContent.Header = Header;
TableContent.FilterBar = FilterBar;
TableContent.Table = Table;

export default TableContent;
