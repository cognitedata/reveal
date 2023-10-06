import { useSelector } from 'react-redux';

import { RootState } from '../../../store/rootReducer';
import { selectAllSelectedIds } from '../../Common/store/files/selectors';

export const useIsSelectedInProcess = (id: number) => {
  const selectedIds = useSelector(({ fileReducer }: RootState) =>
    selectAllSelectedIds(fileReducer)
  );
  return selectedIds.includes(id);
};

export const useProcessFilesSelected = () => {
  const selectedIds = useSelector(({ fileReducer }: RootState) =>
    selectAllSelectedIds(fileReducer)
  );
  return !!selectedIds.length;
};
