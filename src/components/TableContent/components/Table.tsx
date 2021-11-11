import React, { useMemo } from 'react';
import BaseTable from 'react-base-table';
import styled from 'styled-components';
import { Flex } from '@cognite/cogs.js';
import { getColumns, getRows } from 'components/TableContent/mock';

export const Table = (): JSX.Element => {
  const columns = useMemo(() => getColumns(), []);
  const rows = useMemo(() => getRows(), []);
  return (
    <Flex style={{ width: '100%', height: '100%' }}>
      <StyledBaseTable columns={columns} data={rows} width={600} height={400} />
    </Flex>
  );
};

const StyledBaseTable = styled(BaseTable)`
  width: 100%;
`;
