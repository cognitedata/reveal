import { useTable, Column, useFlexLayout, useResizeColumns } from 'react-table';
import { useSticky } from 'react-table-sticky';
import { TableData } from 'types';

type Props = {
  columns: Column<TableData>[];
  data: TableData[];
  className: string;
  defaultColumn?: {
    minWidth: number;
    width: number;
    maxWidth: number;
  };
};

export const HeadlessTable = ({
  columns,
  data,
  className,
  defaultColumn = {
    minWidth: NaN,
    width: NaN,
    maxWidth: NaN,
  },
}: Props) => {
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

  return !columns || !data ? (
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
