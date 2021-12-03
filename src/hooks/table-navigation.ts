import { useContext } from 'react';

import { RawExplorerContext } from 'contexts';
import { useTableData } from 'hooks/table-data';

const COLUMNS_IGNORE = ['column-index', 'lastUpdatedColumn', 'key'];

export const useColumnNavigation = () => {
  const { selectedColumnKey, setSelectedColumnKey } =
    useContext(RawExplorerContext);
  const { filteredColumns } = useTableData();

  const getActiveColumnIndex = () => {
    const activeColumnIndex = filteredColumns.findIndex(
      (column) => column.dataKey === selectedColumnKey
    );
    return activeColumnIndex === -1 ? 0 : activeColumnIndex;
  };

  const moveToColumn = (direction: 'prev' | 'next') => {
    if (!selectedColumnKey) return;
    const activeColumnIndex = getActiveColumnIndex();

    if (direction === 'prev') {
      const prevIndex =
        activeColumnIndex > 1
          ? activeColumnIndex - 1
          : filteredColumns.length - 1;
      const prevColumnKey =
        filteredColumns[prevIndex]?.dataKey ?? filteredColumns[1]?.dataKey;
      setSelectedColumnKey(prevColumnKey);
    }
    if (direction === 'next') {
      const nextIndex =
        activeColumnIndex < filteredColumns.length - 1
          ? activeColumnIndex + 1
          : 1;
      const nextColumnKey =
        filteredColumns[nextIndex]?.dataKey ?? filteredColumns[1]?.dataKey;
      setSelectedColumnKey(nextColumnKey);
    }
  };

  const onPrevColumnClick = () => moveToColumn('prev');
  const onNextColumnClick = () => moveToColumn('next');

  const canNavigate =
    filteredColumns.filter((column) => !COLUMNS_IGNORE.includes(column.dataKey))
      .length > 0;

  return { canNavigate, onPrevColumnClick, onNextColumnClick };
};
