import { useSelector } from 'react-redux';

import { selectAllSelectedIds } from '@vision/modules/Common/store/files/selectors';
import { RootState } from '@vision/store/rootReducer';

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
