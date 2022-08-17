import { CellFocusedEvent, Column } from 'ag-grid-community';
import { useCallback } from 'react';

interface getCellPositionProps {
  rowIndex: number;
  totalRows: number;
  columns: Column[];
  currentColId: string;
}

interface CellPosition {
  isFirstRow: boolean;
  isLastRow: boolean;
  isFirstCol: boolean;
  isLastCol: boolean;
  colIndex: number;
}

export const useTypeDefsKeyboardActions = () => {
  const getCellPosition = useCallback(
    (props: getCellPositionProps): CellPosition => {
      const { rowIndex, totalRows, columns, currentColId } = props;

      const isFirstRow = rowIndex === 0;
      // rows are using indexes so it is always -1
      const isLastRow = rowIndex === totalRows - 1;

      const colIndex = columns.findIndex(
        (col) => col.getColDef().field === currentColId
      );

      const isFirstCol = colIndex === 0;
      const isLastCol = colIndex === columns.length;

      return {
        isFirstRow,
        isLastRow,
        isFirstCol,
        isLastCol,
        colIndex,
      };
    },
    []
  );

  const isFocusInsideGrid = useCallback(
    (cellPosition: CellPosition): boolean => {
      const { isLastRow, isLastCol, isFirstCol, isFirstRow } = cellPosition;
      return (isLastRow && isLastCol) || (isFirstCol && isFirstRow);
    },
    []
  );

  // This should be refactored, just an experiment
  const onCellFocused = useCallback(
    (e: CellFocusedEvent) => {
      const colId = (e.column as Column).getColId();

      const cellPosition = getCellPosition({
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        columns: e.columnApi.getColumns()!,
        currentColId: colId,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        rowIndex: e.rowIndex!,
        totalRows: e.api.getDisplayedRowCount(),
      });

      let controlSelector = 'input';
      if (colId === 'actions') {
        controlSelector = 'button';
      }

      const selector = `.cog-data-grid div[row-index="${e.rowIndex}"] [col-id="${colId}"] ${controlSelector}`;
      const input = document.querySelector(selector) as HTMLInputElement;

      if (
        input &&
        !isFocusInsideGrid(cellPosition) &&
        ['nonNull', 'actions'].includes(colId)
      ) {
        input.focus();
      }
    },
    [getCellPosition, isFocusInsideGrid]
  );

  return {
    onCellFocused,
  };
};
