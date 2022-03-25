import { useMemo } from 'react';
import { useTable, Column, useFlexLayout } from 'react-table';
import { useSticky } from 'react-table-sticky';

import { TableData } from '../../models/sequences';

import { StyledBidMatrixTable } from './elements';

export const BidmatrixTable = ({
  tableHeader,
  tableData,
}: {
  tableHeader: Column<TableData>[];
  tableData: TableData[];
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
    <StyledBidMatrixTable {...getTableProps()}>
      <thead>
        {
          // Loop over the header rows
          headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
              {
                // Loop over the headers in each row
                headerGroup.headers.map((column) => (
                  <th {...column.getHeaderProps()} key={column.id}>
                    <div className="th-container">
                      {column.render('Header')}
                    </div>
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
              <tr {...row.getRowProps()} key={row.id}>
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
      </tbody>
    </StyledBidMatrixTable>
  );
};

export default BidmatrixTable;
