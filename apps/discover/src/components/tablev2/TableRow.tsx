import React, { memo } from 'react';
import { Row } from 'react-table';

import noop from 'lodash/noop';

import {
  TableRow as DefaultTableRow,
  TableCell,
  OverlayCell,
  HoverContentWrapper,
} from './elements';
import { useClickPreventionOnDoubleClick } from './hooks/clickPreventionOnDoubleClick';
import {
  HandleRowClick,
  RenderRowSubComponent,
  HandleRowMouseEnter,
  HandleRowMouseLeave,
} from './Table';
import { TableCell as RenderTableCell } from './TableCell';
import { RowOptions } from './types';

interface RowProps<T extends Record<string, unknown>> {
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
}
const CustomRowComp = <T extends Record<string, unknown>>({
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
  disabledRowClickCells = [],
}: React.PropsWithChildren<RowProps<T>>) => {
  const [onHandleClick, onHandleDoubleClick] = useClickPreventionOnDoubleClick(
    () => handleRowClick && handleRowClick(row),
    () => handleDoubleClick && handleDoubleClick(row)
  );

  const RowComponent = TableRow || DefaultTableRow;

  disabledRowClickCells.push('selection');

  // @ts-expect-error overrides outdated react table types
  const { isSelected, isExpanded, isIndeterminate, isSomeSelected } = row;

  const { style: _unused, ...rest } = row.getRowProps();

  const renderTableRow = React.useMemo(() => {
    return row.cells.map((cell) => (
      <TableCell
        {...cell.getCellProps()}
        onClick={
          disabledRowClickCells.includes(cell.column.id) ? noop : onHandleClick
        }
        onDoubleClick={
          disabledRowClickCells.includes(cell.column.id)
            ? noop
            : onHandleDoubleClick
        }
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
        onMouseEnter={() => {
          if (handleMouseEnter) {
            handleMouseEnter(row);
          }
        }}
        onMouseLeave={() => {
          if (handleMouseLeave) {
            handleMouseLeave(row);
          }
        }}
      >
        {renderTableRow}

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
        <RowComponent expandedRow>
          <TableCell colSpan={99} data-testid="table-cell-expanded">
            {renderRowSubComponent({ row })}
          </TableCell>
        </RowComponent>
      )}
    </>
  );
};
export const CustomRow = memo(CustomRowComp) as typeof CustomRowComp;
