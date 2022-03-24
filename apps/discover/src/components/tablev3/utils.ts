import { Cell, HeaderGroup } from 'react-table';

import layers from 'utils/zindex';

import { ColumnType } from './types';

export const getStickyColumnHeadersStyles = <T extends object>(
  headers: HeaderGroup<T>[],
  columns: ColumnType<T>[]
) => {
  let left = 0;

  return columns.map((column, index) => {
    const columnWidth = headers[index].width || 0;

    if (!column.stickyColumn) {
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

  return columns.map((column, index) => {
    const columnWidth = cells[index].column.width || 0;

    if (!column.stickyColumn) {
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
