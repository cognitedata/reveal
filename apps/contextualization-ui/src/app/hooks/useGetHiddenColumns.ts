import { useMemo } from 'react';

import { ColumnDef } from '@tanstack/react-table';

export function useGetHiddenColumns<T>(
  columns: ColumnDef<T>[],
  visibleColumns: string[]
): string[] {
  return useMemo(() => {
    return (
      columns
        .filter(
          (column) =>
            !visibleColumns.includes(
              // @ts-ignore Don't know why `accessorKey` is not recognized from the type -_-
              column.accessorKey || column?.id
            )
        )
        // @ts-ignore
        .map((column) => column.accessorKey || column.id)
    );
  }, [columns, visibleColumns]);
}
