import { UseTableRowProps } from 'react-table';

import { sortByCaseInsensitive } from './sortByCaseInsensitive';

export const sortByAlphanumeric = <T extends Record<string, unknown>>(
  firstRow: UseTableRowProps<T>,
  secondRow: UseTableRowProps<T>,
  columnName: string
) => {
  const rowOneColumn = firstRow.values[columnName];
  const rowTwoColumn = secondRow.values[columnName];
  return sortByCaseInsensitive(rowOneColumn, rowTwoColumn);
};
