import { useCallback, useEffect, useMemo } from 'react';
import BaseTable, { AutoResizer, ColumnShape } from 'react-base-table';
import styled from 'styled-components';
import { Colors, Flex } from '@cognite/cogs.js';

import { TABLE_ROW_HEIGHT } from 'utils/constants';

import { HeaderRender, EmptyRender } from './customRenders';
import { ExpandedCellModal } from './ExpandedCellModal';
import { Cell } from './Cell';
import { ProfilingSidebar } from 'components/ProfilingSidebar';
import { useCellSelection } from 'hooks/table-selection';

type Props = {
  rows: any;
  columns: any;
  isEmpty?: boolean;
  onEndReach?: () => void;
};

export const Table = (props: Props): JSX.Element => {
  const { rows, columns, isEmpty, onEndReach } = props;
  const { deselectCell } = useCellSelection();

  const newColumns = useMemo(
    () =>
      columns.map((column: ColumnShape) => ({
        ...column,
        cellRenderer: (props: any) => <Cell {...props} />,
        // Default dataGetter for react-base-table uses path segments which
        // causes issues with column names including the dot (`.`) character.
        // Therefore this custom dataGetter is needed.
        // https://github.com/Autodesk/react-base-table/blob/4573fc98798f5313a5902c5f0c6dcde99480a159/src/utils.js#L158
        dataGetter: ({
          column,
          rowData,
        }: {
          column: ColumnShape;
          rowData: Record<string, any>;
        }) => rowData[column.key],
      })),
    [columns]
  );

  const onCellClickOutside = useCallback(() => {
    deselectCell();
  }, [deselectCell]);

  useEffect(() => {
    document.addEventListener('click', onCellClickOutside);
    return () => {
      document.removeEventListener('click', onCellClickOutside);
    };
  }, [onCellClickOutside]);

  return (
    <StyledTableWrapper>
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
            headerRenderer={(props: any) => <HeaderRender {...props} />}
            emptyRenderer={(props: any) => <EmptyRender {...props} />}
            onEndReached={() => onEndReach && onEndReach()}
          />
        )}
      </AutoResizer>
      <ProfilingSidebar />
      <ExpandedCellModal />
    </StyledTableWrapper>
  );
};

const TABLE_PREFIX = 'BaseTable__';
const StyledTableWrapper = styled(Flex)`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  transform: translate(0);
`;
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
    &:last-child {
      padding-right: 0;
    }
  }
  .${TABLE_PREFIX}row-cell {
    justify-content: flex-end;
    flex-wrap: wrap;
    overflow: visible !important;
    padding: 0;
    &:last-child {
      padding-right: 0;
    }
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
