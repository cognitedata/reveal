import { useMemo } from 'react';
import BaseTable, { AutoResizer, ColumnShape } from 'react-base-table';

import styled from 'styled-components';

import { reactBaseTableDataGetter } from '@transformations/utils';
import { TABLE_ROW_HEIGHT } from '@transformations/utils/constants';

import { Colors, Flex } from '@cognite/cogs.js';

import { Cell } from './Cell';
import { HeaderRender, EmptyRender } from './customRenders';
import { ExpandedCellModal } from './ExpandedCellModal';

type Props = {
  database: string;
  table: string;
  rows: any;
  columns: any;
  isEmpty?: boolean;
  onEndReach?: () => void;
};

export const RawTable = (props: Props): JSX.Element => {
  const { rows, columns, isEmpty, onEndReach, database, table } = props;
  const newColumns = useMemo(
    () =>
      columns.map((column: ColumnShape) => ({
        ...column,
        cellRenderer: (props: any) => <Cell {...props} />,
        // Default dataGetter for react-base-table uses path segments which
        // causes issues with column names including the dot (`.`) character.
        // Therefore this custom dataGetter is needed.
        // https://github.com/Autodesk/react-base-table/blob/4573fc98798f5313a5902c5f0c6dcde99480a159/src/utils.js#L158
        dataGetter: reactBaseTableDataGetter,
      })),
    [columns]
  );

  return (
    <StyledTableWrapper>
      <AutoResizer>
        {({ width, height }) => (
          <StyledBaseTable
            width={width}
            height={height}
            columns={isEmpty ? [] : newColumns}
            data={rows}
            rowHeight={TABLE_ROW_HEIGHT}
            headerHeight={isEmpty ? 0 : TABLE_ROW_HEIGHT}
            headerRenderer={(props: any) => <HeaderRender {...props} />}
            emptyRenderer={() => (
              <EmptyRender database={database} table={table} />
            )}
            onEndReached={() => onEndReach && onEndReach()}
          />
        )}
      </AutoResizer>
      <ExpandedCellModal />
    </StyledTableWrapper>
  );
};

const TABLE_PREFIX = 'BaseTable';
const StyledTableWrapper = styled(Flex)`
  width: 100%;
  height: 100%;
  position: relative;
  flex: 1;
  overflow: hidden;
  transform: translate(0);
  border-right: 1px solid ${Colors['decorative--grayscale--300']};
  border-left: 1px solid ${Colors['decorative--grayscale--300']};
`;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const StyledBaseTable = styled(BaseTable)`
  .${TABLE_PREFIX} {
    &__table {
      box-shadow: none;
      box-sizing: border-box;
    }
    &__table-main {
      outline: none;
    }
    &__header-row {
      height: 32px;
      box-shadow: none;
    }
    &__header-cell {
      padding: 0;
      border-top: 1px solid ${Colors['decorative--grayscale--300']};
      background-color: ${Colors['decorative--grayscale--100']};
      &:hover {
        background-color: ${Colors['decorative--grayscale--200']};
      }
      &:last-child {
        padding-right: 0;
      }
    }
    &__row-cell {
      justify-content: flex-end;
      flex-wrap: wrap;
      overflow: visible !important;
      padding: 0;
      &:last-child {
        padding-right: 0;
      }
    }
    &__header-cell,
    &__row-cell {
      border-bottom: 1px solid ${Colors['decorative--grayscale--300']};
      border-right: 1px solid ${Colors['decorative--grayscale--300']};
    }
    &__header-cell:first-child,
    &__row-cell:first-child {
      padding: 0;
      background-color: ${Colors['decorative--grayscale--100']};
    }
    &__header-row,
    &__row {
      border-bottom: none;
    }
    &__row:hover {
      background: tomato;
      .${TABLE_PREFIX}__row-cell {
        background-color: ${Colors['decorative--grayscale--200']};
      }
    }
  }
`;
