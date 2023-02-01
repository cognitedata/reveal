/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect } from 'react';
import { useTable } from 'react-table';
import { useCellRangeSelection } from 'react-table-plugins';
import styled from 'styled-components';
import { handleOnPasteEvent } from './helpers';

const MAX_COLUMNS = 8;
const MIN_ROW_LENGTH = 50;
const NEW_ROW_COUNT = 50;

const EditableCell = ({
  value: initialValue,
  row: { index },
  column: { id },
  updateMyData,
}: any) => {
  const [value, setValue] = React.useState(initialValue);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const onBlur = () => {
    updateMyData(index, id, value);
  };

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return <input value={value} onChange={onChange} onBlur={onBlur} />;
};

const defaultColumn = {
  Cell: EditableCell,
};

const addNewRows = (setter: (a: any) => void, count?: number) => {
  setter((old: any[]) => {
    const currentLength = old.length;
    const emptyRows = count || NEW_ROW_COUNT;
    const emptyRowsArray = Array.from({ length: emptyRows }, (_, i) => ({
      id: 'idRow' + currentLength + i,
    }));
    return [...old, ...emptyRowsArray];
  });
};

export function Table({ columns, dataSource: inputData }: any) {
  const [data, setData] = React.useState(inputData);
  const [newColumns, setNewColumns] = React.useState(columns);

  useEffect(() => {
    const emptyColumns = MAX_COLUMNS - columns.length;
    if (emptyColumns < 0) {
      return;
    }

    const emptyColumnsLeft = Math.floor(emptyColumns / 2);
    const emptyColumnsRight = emptyColumns - emptyColumnsLeft;

    const emptyColumnsLeftArray = Array.from(
      { length: emptyColumnsLeft },
      (_, i) => ({
        Header: '',
        accessor: `empty-${i}`,
      })
    );

    const emptyColumnsRightArray = Array.from(
      { length: emptyColumnsRight },
      (_, i) => ({
        Header: '',
        accessor: `empty+${i}`,
      })
    );

    setNewColumns([
      ...emptyColumnsLeftArray,
      ...columns,
      ...emptyColumnsRightArray,
    ]);

    if (data.length < MIN_ROW_LENGTH) {
      addNewRows(setData, MIN_ROW_LENGTH - data.length);
    }
  }, []);

  const handleScroll = (e: any) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight) {
      addNewRows(setData);
    }
  };

  const updateMyData = (rowIndex: number, columnId: number, value: string) => {
    setData((old: any[]) =>
      old.map((row, index) => {
        if (index === rowIndex) {
          return {
            ...old[rowIndex],
            [columnId]: value,
          };
        }
        return row;
      })
    );
  };

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
      columns: newColumns,
      data,
      cellIdSplitBy: 'cols_rows',
      defaultColumn,
      initialState: {
        // @ts-ignore
        selectedCellIds: {},
      },
      updateMyData,
    },
    useCellRangeSelection
  );

  const cellsSelected = { ...currentSelectedCellIds, ...selectedCellIds };

  const onPaste = (e: ClipboardEvent) => {
    if (e.clipboardData === null) {
      return;
    }
    if (Object.keys(selectedCellIds).length === 0) {
      return;
    }
    e.preventDefault();
    handleOnPasteEvent(e, selectedCellIds, cellsById, updateMyData);
    setSelectedCellIds({});
  };

  const onKeyPressHandling = (e: KeyboardEvent) => {
    // on control + a to select all cells
    if ((e.ctrlKey && e.key === 'a') || (e.metaKey && e.key === 'a')) {
      e.preventDefault();
      const allCellIds = Object.keys(cellsById);
      const cellMap = allCellIds.reduce((acc: any, cellId: string) => {
        acc[cellId] = true;
        return acc;
      }, {});
      setSelectedCellIds(cellMap);
    }
    // on backspace to delete content of all selected cells
    if (e.key === 'Backspace' && Object.keys(selectedCellIds).length > 0) {
      e.preventDefault();
      const cellIds = Object.keys(selectedCellIds);
      const cells = cellIds.map((cellId) => cellsById[cellId]);

      cells.forEach((cell) => {
        const { row, column } = cell;
        const cellValue = '';
        updateMyData(row.index, column.id, cellValue);
      });
      setSelectedCellIds({});
    }

    // on control + c to copy selected cells
    if ((e.ctrlKey && e.key === 'c') || (e.metaKey && e.key === 'c')) {
      e.preventDefault();
      console.log('selectedCellIds', selectedCellIds);
      if (Object.keys(selectedCellIds).length === 0) {
        const currentCell = e.target as HTMLInputElement;
        const cellValue = currentCell.value;
        navigator.clipboard.writeText(cellValue);
        return;
      }

      const SEPERATORCHAR = '\t';
      const cellIds = Object.keys(selectedCellIds);
      const cells = cellIds.map((cellId) => cellsById[cellId]);

      // for each cell, get the value and add to text, separated by tab and new line
      const text = cells.reduce((acc: string, cell: any, index: number) => {
        const { row, column } = cell;
        const cellValue = row.values[column.id] || '';

        if (index === 0) {
          acc += cellValue;
          // if the previous cell is not in the same row, add new line
        } else if (cells[index - 1].row.index !== row.index) {
          acc +=
            `
` + cellValue;
          // if the previous cell is in the same row, add space
        } else {
          acc += SEPERATORCHAR + cellValue;
        }
        return acc;
      }, '');

      navigator.clipboard.writeText(text);
    }
  };

  React.useEffect(() => {
    document.addEventListener('paste', onPaste);
    document.addEventListener('keydown', onKeyPressHandling);
    return () => {
      document.removeEventListener('paste', onPaste);
      document.removeEventListener('keydown', onKeyPressHandling);
    };
  }, [selectedCellIds]);

  return (
    <div className="App">
      <TableContainer onScroll={handleScroll}>
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
      </TableContainer>
    </div>
  );
}

const TableContainer = styled.div`
  overflow-y: scroll;
  height: 500px;
`;
