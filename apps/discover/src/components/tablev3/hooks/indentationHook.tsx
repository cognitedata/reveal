/* eslint-disable @typescript-eslint/ban-types */
import { Hooks } from 'react-table';

export const indentationHook =
  <T extends Object>(indent: string | true) =>
  (hooks: Hooks<T>) => {
    hooks.visibleColumns.push((restOfColumns) => [
      // Let's make a column for indentation
      {
        id: 'indentation',
        disableResizing: true,
        width: indent === true ? '30px' : indent,

        // Return a space to prevent the empty state from showing
        Header: () => ' ',
        Cell: () => ' ',
      },
      ...restOfColumns,
    ]);
  };
