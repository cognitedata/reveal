import { useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { selectExplorerSelectedIds } from 'src/modules/Explorer/store/selectors';

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
