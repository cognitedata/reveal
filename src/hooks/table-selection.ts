import { useContext } from 'react';
import isNil from 'lodash/isNil';

import { RawExplorerContext } from 'contexts';

const NO_CELL_SELECTED = { rowIndex: undefined, columnIndex: undefined };

export const useTableSelection = () => {
  const { selectedCell, setSelectedCell } = useContext(RawExplorerContext);

  const isCellSelected = (rowIndex: number, columnIndex: number) => {
    return (
      selectedCell.rowIndex === rowIndex &&
      selectedCell.columnIndex === columnIndex
    );
  };

  const deselectCell = () => {
    if (!isNil(selectedCell.rowIndex) && !isNil(selectedCell.columnIndex))
      setSelectedCell(NO_CELL_SELECTED);
  };

  return { selectedCell, setSelectedCell, isCellSelected, deselectCell };
};
