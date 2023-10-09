import { useSelector } from 'react-redux';

import { RootState } from '../../../store/rootReducer';

import { selectExplorerSelectedIds } from './selectors';

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
