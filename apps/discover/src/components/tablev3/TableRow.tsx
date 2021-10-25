import React, { memo } from 'react';
import { Cell, Row } from 'react-table';

import noop from 'lodash/noop';

import {
  TableRow as DefaultTableRow,
  TableCell,
  HoverCell,
  HoverContentWrapper,
} from './elements';
import { useClickPreventionOnDoubleClick } from './hooks/clickPreventionOnDoubleClick';
import { TableCell as RenderTableCell } from './TableCell';
import {
  RowOptions,
  HandleRowClick,
  RenderRowSubComponent,
  HandleRowMouseEnter,
  HandleRowMouseLeave,
} from './types';

// eslint-disable-next-line @typescript-eslint/ban-types
interface RowProps<T extends Object> {
  row: Row<T>;
  visibleColumns: any[];
  handleRowClick?: HandleRowClick;
  handleDoubleClick?: HandleRowClick;
  handleMouseEnter?: HandleRowMouseEnter;
  handleMouseLeave?: HandleRowMouseLeave;
  TableRow?: React.ReactElement;
  renderRowSubComponent?: RenderRowSubComponent;
  renderRowHoverComponent?: RenderRowSubComponent;
  rowOptions?: RowOptions;
  hideBorders?: boolean;
  expanded?: boolean;
  disabledRowClickCells?: string[];
  highlighted?: boolean;
  /**
   * Used as a maximum size for a sub-table
   */
  maxWidth: string;
}
// eslint-disable-next-line @typescript-eslint/ban-types
const CustomRowComp = <T extends Object>({
  row,
  TableRow,
  handleRowClick,
  handleDoubleClick,
  handleMouseEnter,
  handleMouseLeave,
  renderRowSubComponent,
  renderRowHoverComponent,
  hideBorders = false,
  expanded = false,
  highlighted = false,
  disabledRowClickCells = [],
  maxWidth,
}: React.PropsWithChildren<RowProps<T>>) => {
  // @ts-expect-error overrides outdated react table types
  const { isSelected, isExpanded, isIndeterminate, isSomeSelected } = row;
  const { style, ...rest } = row.getRowProps();
  const RowComponent = TableRow || DefaultTableRow;
  const [onHandleClick, onHandleDoubleClick] = useClickPreventionOnDoubleClick(
    () => handleRowClick && handleRowClick(row),
    () => handleDoubleClick && handleDoubleClick(row)
  );

  disabledRowClickCells.push('selection');

  const handleCellClick = (cell: Cell<T, any>) =>
    disabledRowClickCells.includes(cell.column.id) ? noop : onHandleClick;

  const handleCellDoubleClick = (cell: Cell<T, any>) =>
    disabledRowClickCells.includes(cell.column.id) ? noop : onHandleDoubleClick;

  const handleRowMouseEnter = () => {
    if (handleMouseEnter) {
      handleMouseEnter(row);
    }
  };

  const handleRowMouseLeave = () => {
    if (handleMouseLeave) {
      handleMouseLeave(row);
    }
  };

  const renderTableRow = React.useMemo(() => {
    return row.cells.map((cell) => (
      <TableCell
        {...cell.getCellProps()}
        onClick={handleCellClick(cell)}
        onDoubleClick={handleCellDoubleClick(cell)}
        data-testid="table-cell"
        key={`cell-${cell.row.id}-${cell.column.id}`}
      >
        <RenderTableCell cell={cell} />
      </TableCell>
    ));
  }, [isSelected, isExpanded, isIndeterminate, isSomeSelected, row.cells]);

  return (
    <>
      <RowComponent
        {...rest}
        hideBorders={hideBorders}
        data-testid="table-row"
        onMouseEnter={handleRowMouseEnter}
        onMouseLeave={handleRowMouseLeave}
        highlighted={highlighted}
      >
        {renderTableRow}

        {renderRowHoverComponent && (
          <HoverCell>
            <HoverContentWrapper>
              {renderRowHoverComponent({ row })}
            </HoverContentWrapper>
          </HoverCell>
        )}
      </RowComponent>
      {/*
          If the row is in an expanded state, render a row with a
          column that fills the entire length of the table.
          then render whatever content is required
        */}
      {renderRowSubComponent && expanded && (
        <RowComponent
          expandedRow
          maxWidth={maxWidth}
          highlighted={highlighted}
          data-testid="table-row"
        >
          <TableCell data-testid="table-cell-expanded">
            {renderRowSubComponent({ row })}
          </TableCell>
        </RowComponent>
      )}
    </>
  );
};
export const CustomRow = memo(CustomRowComp) as typeof CustomRowComp;
