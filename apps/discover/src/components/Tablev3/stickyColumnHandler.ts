import { Cell, HeaderGroup } from 'react-table';

import get from 'lodash/get';
import head from 'lodash/head';
import layers from 'utils/zindex';

import { ColumnType } from './types';

export const getStickyColumnHeadersStyles = <T extends object>(
  headers: HeaderGroup<T>[],
  columns: ColumnType<T>[]
) => {
  let left = 0;

  /**
   * This is to track the action columns which are added before the data columns.
   * eg: selection, expansion, indentation, etc.
   */
  const indexOfFirstColumnInHeaders = headers.findIndex(
    (header) =>
      header.id === head(columns)?.id || header.Header === head(columns)?.Header
  );

  return headers.map((header, index) => {
    const columnWidth = headers[index].width || 0;

    const isStickyColumn = get(header, 'stickyColumn', false);
    /**
     * `index < indexOfFirstColumnInHeaders` is satisfied for all the action columns.
     * All those action columns will be sticky.
     * Checking `isStickyColumn` only for the data columns.
     * `index >= indexOfFirstColumnInHeaders` is satisfied for all the data columns.
     */
    if (index >= indexOfFirstColumnInHeaders && !isStickyColumn) {
      return undefined;
    }

    /**
     * Making the position sticky.
     * Attribute `left` should be defined to say where the column should be sticked.
     * Position: fixed not works here since it stops the vertical scrolling as well.
     */
    const style = {
      position: 'sticky',
      left,
      zIndex: layers.TABLE_STICKY_COLUMN_HEADER,
    };

    /**
     * Adding the current column width to use as the left position of the next column.
     */
    left += parseInt(String(columnWidth), 10);

    return style;
  });
};

export const getStickyColumnCellsStyles = <T extends object>(
  cells: Cell<T>[],
  columns: ColumnType<T>[]
) => {
  let left = 0;

  /**
   * This is to track the action columns which are added before the data columns.
   * eg: selection, expansion, indentation, etc.
   */
  const indexOfFirstColumnInCells = cells.findIndex(
    (cell) =>
      cell.column.id === head(columns)?.id ||
      cell.column.Header === head(columns)?.Header
  );

  return cells.map((cell, index) => {
    const columnWidth = cells[index].column.width || 0;

    const isStickyColumn = get(cell.column, 'stickyColumn', false);
    /**
     * `index < indexOfFirstColumnInHeaders` is satisfied for all the action columns.
     * All those action columns will be sticky.
     * Checking `isStickyColumn` only for the data columns.
     * `index >= indexOfFirstColumnInHeaders` is satisfied for all the data columns.
     */
    if (index >= indexOfFirstColumnInCells && !isStickyColumn) {
      return undefined;
    }

    /**
     * Making the position sticky.
     * Attribute `left` should be defined to say where the column should be sticked.
     * Position: fixed not works here since it stops the vertical scrolling as well.
     */
    const style = {
      position: 'sticky',
      left,
      zIndex: layers.TABLE_STICKY_COLUMN_CELL,
    };

    /**
     * Adding the current column width to use as the left position of the next column.
     */
    left += parseInt(String(columnWidth), 10);

    return style;
  });
};
