import { useContext } from 'react';

import { RawExplorerContext } from 'contexts';
import { useTableData } from 'hooks/table-data';

export const useColumnNavigation = () => {
  const { selectedColumn, setSelectedColumn } = useContext(RawExplorerContext);
  const { filteredColumns } = useTableData();

  const onPrevColumnClick = () => {};
  const onNextColumnClick = () => {};

  return { onPrevColumnClick, onNextColumnClick };
};
