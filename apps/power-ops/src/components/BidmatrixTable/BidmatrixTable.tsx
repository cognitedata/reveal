import { useMemo } from 'react';
import { useTable, Column, useFlexLayout } from 'react-table';
import { useSticky } from 'react-table-sticky';
import { TableData } from 'types';

export const BidmatrixTable = ({
  tableHeader,
  tableData,
  className,
}: {
  tableHeader: Column<TableData>[];
  tableData: TableData[];
  className: string;
}) => {
  const data = useMemo(() => tableData, [tableData]);
  const columns = useMemo(() => tableHeader, [tableHeader]);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable(
      {
        columns,
        data,
      },
      useFlexLayout,
      useSticky
    );

  return !tableHeader || !tableData ? (
    <div>No Data</div>
  ) : (
    <table className={className} {...getTableProps()}>
      <thead>
        {
          // Loop over the header rows
          headerGroups.map((headerGroup) => (
            <tr
              {...headerGroup.getHeaderGroupProps()}
              key={headerGroup.getHeaderGroupProps().key}
            >
              {
                // Loop over the headers in each row
                headerGroup.headers.map((column) => (
                  <th {...column.getHeaderProps()} key={column.id}>
                    <div>{column.render('Header')}</div>
                  </th>
                ))
              }
            </tr>
          ))
        }
      </thead>
      <tbody {...getTableBodyProps()}>
        {
          // Loop over the table rows
          rows.map((row) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()} key={row.getRowProps().key}>
                {
                  // Loop over the rows cells
                  row.cells.map((cell) => {
                    return (
                      <td
                        {...cell.getCellProps()}
                        key={cell.getCellProps().key}
                      >
                        {cell.render('Cell')}
                      </td>
                    );
                  })
                }
              </tr>
            );
          })
        }
        {data.length < 25 &&
          // Empty row at bottom of table for formatting
          headerGroups.map((headerGroup: any) => (
            <tr
              {...headerGroup.getHeaderGroupProps()}
              key={`${headerGroup.id}_end`}
            >
              {headerGroup.headers.map((column: any) => (
                <td {...column.getHeaderProps()} key={column.id}>
                  <div>
                    <span>&nbsp;</span>
                  </div>
                </td>
              ))}
            </tr>
          ))}
      </tbody>
    </table>
  );
};
