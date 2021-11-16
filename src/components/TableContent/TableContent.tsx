import React from 'react';

import { Colors, Flex } from '@cognite/cogs.js';
import styled from 'styled-components';

import { TAB_HEIGHT } from 'utils/constants';

import { Header, FilterBar, Table } from './components';

const TableContent = () => {
  return (
    <Wrapper direction="column">
      <TableContent.Header />
      <TableContent.FilterBar />
      <TableContent.Table />
    </Wrapper>
  );
};

const Wrapper = styled(Flex)`
  border-left: 1px solid ${Colors['greyscale-grey3'].hex()};
  height: calc(100% - ${TAB_HEIGHT}px);
`;

TableContent.Header = Header;
TableContent.FilterBar = FilterBar;
TableContent.Table = Table;

export default TableContent;
