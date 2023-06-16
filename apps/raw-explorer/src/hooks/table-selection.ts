import { useContext, useMemo } from 'react';

import { RawExplorerContext } from '@raw-explorer/contexts';
import { useTableData } from '@raw-explorer/hooks/table-data';
import { NO_CELL_SELECTED } from '@raw-explorer/utils/table';

export const useCellSelection = () => {
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

export const useColumnSelection = () => {
  const { selectedColumnKey } = useContext(RawExplorerContext);
  const { columns } = useTableData();

  const getSelectedColumn = () => {
    const activeColumn = columns.find(
      (column) => selectedColumnKey && column.dataKey === selectedColumnKey
    );
    return activeColumn;
  };

  const selectedColumn = useMemo(getSelectedColumn, [
    columns,
    selectedColumnKey,
  ]);

  return { selectedColumn };
};
