import { useContext } from 'react';
import { RawExplorerContext } from 'contexts';

export const useTableSelection = () => {
  const { selectedCell, setSelectedCell } = useContext(RawExplorerContext);

  const isCellSelected = (rowIndex: number, columnIndex: number) => {
    return (
      selectedCell.rowIndex === rowIndex &&
      selectedCell.columnIndex === columnIndex
    );
  };

  return { selectedCell, setSelectedCell, isCellSelected };
};
