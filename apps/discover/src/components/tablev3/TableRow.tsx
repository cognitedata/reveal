import React, { memo } from 'react';
import { Cell, Row } from 'react-table';

import noop from 'lodash/noop';

import {
  TableRow as DefaultTableRow,
  TableCell,
  OverlayCell,
  HoverContentWrapper,
  OverlayContentWrapper,
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
  renderRowOverlayComponent?: RenderRowSubComponent;
  renderRowHoverComponent?: RenderRowSubComponent;
  rowOptions?: RowOptions;
  hideBorders?: boolean;
  expanded?: boolean;
  disabledRowClickCells?: string[];
  highlighted?: boolean;
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
  renderRowOverlayComponent,
  renderRowHoverComponent,
  hideBorders = false,
  expanded = false,
  highlighted = false,
  disabledRowClickCells = [],
}: React.PropsWithChildren<RowProps<T>>) => {
  const { style: _unused, ...rest } = row.getRowProps();
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

  const renderTableRow = () => {
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
  };

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
        {renderTableRow()}

        {renderRowOverlayComponent && (
          <OverlayCell>
            <OverlayContentWrapper>
              {renderRowOverlayComponent({ row })}
            </OverlayContentWrapper>
          </OverlayCell>
        )}

        {renderRowHoverComponent && (
          <OverlayCell>
            <HoverContentWrapper>
              {renderRowHoverComponent({ row })}
            </HoverContentWrapper>
          </OverlayCell>
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
