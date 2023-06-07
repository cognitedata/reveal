import { ColumnDef } from '@tanstack/react-table';
import { memoize } from 'lodash';

export function getHiddenColumns<T>(
  columns: ColumnDef<T>[],
  visibleColumns: string[]
): string[] {
  const memoizedFunction = memoize(getColumns);

  return memoizedFunction<T>(columns, visibleColumns);
}

const getColumns = <T>(columns: ColumnDef<T>[], visibleColumns: string[]) => {
  return (
    columns
      .filter(
        (column) =>
          // @ts-ignore Don't know why `accessorKey` is not recognized from the type -_-
          !visibleColumns.includes(column.accessorKey || column?.id)
      )
      // @ts-ignore
      .map((column) => column.accessorKey || column.id)
  );
};
