import { useContext, useMemo } from 'react';

import { RawExplorerContext } from '@transformations/contexts';
import { useTableData } from '@transformations/hooks/table-data';
import { NO_CELL_SELECTED } from '@transformations/utils/table';

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

export const useColumnSelection = (database: string, table: string) => {
  const { selectedColumnKey } = useContext(RawExplorerContext);
  const { columns } = useTableData(database, table);

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
