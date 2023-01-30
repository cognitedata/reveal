/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';
import { useTable } from 'react-table';
import { useCellRangeSelection } from 'react-table-plugins';
import { handleOnPasteEvent } from './helpers';

export function Table({ columns, data }: any) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    // @ts-ignore
    state: { selectedCellIds, currentSelectedCellIds, isSelectingCells },
    // @ts-ignore
    getCellsBetweenId,
    // @ts-ignore
    setSelectedCellIds,
    // @ts-ignore
    cellsById,
  } = useTable(
    {
      columns,
      data,
      cellIdSplitBy: 'cols_rows',
      initialState: {
        // @ts-ignore
        selectedCellIds: {},
      },
    },
    useCellRangeSelection
  );

  const cellsSelected = { ...currentSelectedCellIds, ...selectedCellIds };

  const onPaste = (e: ClipboardEvent) => {
    if (e.clipboardData === null) {
      return;
    }
    handleOnPasteEvent(e, selectedCellIds, cellsById);
    setSelectedCellIds({});
  };

  React.useEffect(() => {
    document.addEventListener('paste', onPaste);
    return () => {
      document.removeEventListener('paste', onPaste);
    };
  }, [selectedCellIds]);

  return (
    <div>
      <table {...getTableProps()}>
        <thead>
          {headerGroups.map(
            (headerGroup: {
              getHeaderGroupProps: () => JSX.IntrinsicAttributes &
                React.ClassAttributes<HTMLTableRowElement> &
                React.HTMLAttributes<HTMLTableRowElement>;
              headers: any[];
            }) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th {...column.getHeaderProps()}>
                    {column.render('Header')}
                  </th>
                ))}
              </tr>
            )
          )}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row, i: any) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  return (
                    <td
                      // @ts-ignore
                      {...cell.getCellRangeSelectionProps()}
                      {...cell.getCellProps()}
                      style={
                        // @ts-ignore
                        cellsSelected[cell.id]
                          ? {
                              backgroundColor: '#6beba8',
                              userSelect: 'none',
                            }
                          : { backgroundColor: 'white', userSelect: 'none' }
                      }
                    >
                      {cell.render('Cell')}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
