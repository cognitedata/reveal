import React, { useMemo } from 'react';
import BaseTable, { AutoResizer } from 'react-base-table';
import styled from 'styled-components';
import { Colors, Flex } from '@cognite/cogs.js';
import { getColumns, getRows } from 'components/TableContent/mock';

export const Table = (): JSX.Element => {
  const columns = useMemo(() => getColumns(), []);
  const rows = useMemo(() => getRows(), []);
  return (
    <Flex style={{ width: '100%', height: '100%' }}>
      <AutoResizer>
        {({ width, height }) => (
          <StyledBaseTable
            width={width}
            height={height}
            columns={columns}
            data={rows}
            rowHeight={36}
            headerHeight={36}
          />
        )}
      </AutoResizer>
    </Flex>
  );
};

const TABLE_PREFIX = 'BaseTable__';
const StyledBaseTable = styled(BaseTable)`
  box-shadow: none;
  .${TABLE_PREFIX}table {
    box-shadow: none;
    box-sizing: border-box;
  }
  .${TABLE_PREFIX}table-main {
    outline: none;
  }
  .${TABLE_PREFIX}header-row {
    height: 36px;
    background-color: ${Colors['greyscale-grey1'].hex()};
    box-shadow: none;
  }
  .${TABLE_PREFIX}header-cell {
    border-top: 1px solid ${Colors['greyscale-grey3'].hex()};
  }
  .${TABLE_PREFIX}row-cell {
    justify-content: flex-end;
    flex-wrap: wrap;
  }
  .${TABLE_PREFIX}header-cell, .${TABLE_PREFIX}row-cell {
    padding: 8px 16px;
    border-bottom: 1px solid ${Colors['greyscale-grey3'].hex()};
    border-right: 1px solid ${Colors['greyscale-grey3'].hex()};
  }
  .${TABLE_PREFIX}header-cell:first-child,
    .${TABLE_PREFIX}row-cell:first-child {
    padding: 0 8px;
    background-color: ${Colors['greyscale-grey1'].hex()};
  }
`;
