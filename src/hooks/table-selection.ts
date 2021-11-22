import { useContext } from 'react';
import { RawExplorerContext } from 'contexts';

const NO_CELL_SELECTED = { rowIndex: undefined, columnIndex: undefined };

export const useTableSelection = () => {
  const { selectedCell, setSelectedCell, isCellExpanded, setIsCellExpanded } =
    useContext(RawExplorerContext);

  const isCellSelected = (rowIndex: number, columnIndex: number) => {
    return (
      selectedCell.rowIndex === rowIndex &&
      selectedCell.columnIndex === columnIndex
    );
  };

  const deselectCell = () => {
    setSelectedCell(NO_CELL_SELECTED);
  };

  return {
    selectedCell,
    setSelectedCell,
    isCellSelected,
    deselectCell,
    isCellExpanded,
    setIsCellExpanded,
  };
};
