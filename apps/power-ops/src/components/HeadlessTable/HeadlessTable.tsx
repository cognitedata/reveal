import { useMemo } from 'react';
import { useTable, Column, useFlexLayout, useResizeColumns } from 'react-table';
import { useSticky } from 'react-table-sticky';
import { TableData } from 'types';

export const HeadlessTable = ({
  tableHeader,
  tableData,
  className,
  defaultColumnSize,
}: {
  tableHeader: Column<TableData>[];
  tableData: TableData[];
  className: string;
  defaultColumnSize?: {
    min: number;
    width: number;
    max: number;
  };
}) => {
  const data = useMemo(() => tableData, [tableData]);
  const columns = useMemo(() => tableHeader, [tableHeader]);

  const defaultColumn = useMemo(
    () => ({
      // When using useFlexLayout:
      minWidth: defaultColumnSize?.min,
      width: defaultColumnSize?.width,
      maxWidth: defaultColumnSize?.max,
    }),
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable(
      {
        columns,
        data,
        defaultColumn,
      },
      useResizeColumns,
      useFlexLayout,
      useSticky
    );

  return !tableHeader || !tableData ? (
    <div>No Data</div>
  ) : (
    <table className={className} {...getTableProps()}>
      <thead>
        {headerGroups.map((group) => (
          <tr
            {...group.getHeaderGroupProps()}
            key={group.getHeaderGroupProps().key}
          >
            {group.headers.map((column) => (
              <th {...column.getHeaderProps()} key={column.id}>
                {column.render('Header')}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()} key={row.getRowProps().key}>
              {row.cells.map((cell) => {
                return (
                  <td {...cell.getCellProps()} key={cell.getCellProps().key}>
                    {cell.render('Cell')}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
