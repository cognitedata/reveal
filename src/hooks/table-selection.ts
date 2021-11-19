import { useState } from 'react';

type SelectedCell = {
  rowIndex: number | undefined;
  columnIndex: number | undefined;
};
export const useTableSelection = () => {
  const [selectedCell, setSelectedCell] = useState<SelectedCell>({
    rowIndex: undefined,
    columnIndex: undefined,
  });

  const isCellSelected = (rowIndex: number, columnIndex: number) => {
    return (
      selectedCell.rowIndex === rowIndex &&
      selectedCell.columnIndex === columnIndex
    );
  };

  return { selectedCell, setSelectedCell, isCellSelected };
};
