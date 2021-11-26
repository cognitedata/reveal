import React, { useMemo } from 'react';
import BaseTable, { AutoResizer, ColumnShape } from 'react-base-table';
import styled from 'styled-components';
import { Colors, Flex } from '@cognite/cogs.js';

import { TABLE_ROW_HEIGHT } from 'utils/constants';

import { headerRenderer, emptyRenderer } from './customRenders';
import { ExpandedCellModal } from './ExpandedCellModal';
import { Cell } from './Cell';

type Props = {
  rows: any;
  columns: any;
  isEmpty?: boolean;
  onEndReach?: () => void;
};

export const Table = (props: Props): JSX.Element => {
  const { rows, columns, isEmpty, onEndReach } = props;

  const newColumns = useMemo(
    () =>
      columns.map((column: ColumnShape) => ({
        ...column,
        cellRenderer: (props: any) => <Cell {...props} />,
      })),
    [columns]
  );

  return (
    <Flex style={{ width: '100%', height: '100%' }}>
      <AutoResizer>
        {({ width, height }) => (
          <StyledBaseTable
            fixed
            width={width}
            height={height}
            columns={isEmpty ? [] : newColumns}
            data={rows}
            rowHeight={TABLE_ROW_HEIGHT}
            headerHeight={isEmpty ? 0 : TABLE_ROW_HEIGHT}
            headerRenderer={headerRenderer}
            emptyRenderer={emptyRenderer}
            onEndReached={() => onEndReach && onEndReach()}
          />
        )}
      </AutoResizer>
      <ExpandedCellModal />
    </Flex>
  );
};

const TABLE_PREFIX = 'BaseTable__';
const StyledBaseTable = styled(BaseTable)`
  .${TABLE_PREFIX}table {
    box-shadow: none;
    box-sizing: border-box;
  }
  .${TABLE_PREFIX}table-main {
    outline: none;
  }
  .${TABLE_PREFIX}header-row {
    height: 36px;
    box-shadow: none;
  }
  .${TABLE_PREFIX}header-cell {
    padding: 0;
    border-top: 1px solid ${Colors['greyscale-grey3'].hex()};
    background-color: ${Colors['greyscale-grey1'].hex()};
    &:hover {
      background-color: ${Colors['greyscale-grey2'].hex()};
    }
  }
  .${TABLE_PREFIX}row-cell {
    padding: 0;
    justify-content: flex-end;
    flex-wrap: wrap;
    overflow: visible !important;
  }
  .${TABLE_PREFIX}header-cell, .${TABLE_PREFIX}row-cell {
    border-bottom: 1px solid ${Colors['greyscale-grey3'].hex()};
    border-right: 1px solid ${Colors['greyscale-grey3'].hex()};
  }
  .${TABLE_PREFIX}header-cell:first-child,
    .${TABLE_PREFIX}row-cell:first-child {
    padding: 0;
    background-color: ${Colors['greyscale-grey1'].hex()};
  }
`;
