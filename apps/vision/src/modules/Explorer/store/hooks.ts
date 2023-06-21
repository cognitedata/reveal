import { useSelector } from 'react-redux';

import { selectExplorerSelectedIds } from '@vision/modules/Explorer/store/selectors';
import { RootState } from '@vision/store/rootReducer';

export const useIsSelectedInExplorer = (id: number) => {
  const selectedIds = useSelector(({ explorerReducer }: RootState) =>
    selectExplorerSelectedIds(explorerReducer)
  );
  return selectedIds.includes(id);
};

export const useExplorerFilesSelected = () => {
  const selectedIds = useSelector(({ explorerReducer }: RootState) =>
    selectExplorerSelectedIds(explorerReducer)
  );
  return !!selectedIds.length;
};
