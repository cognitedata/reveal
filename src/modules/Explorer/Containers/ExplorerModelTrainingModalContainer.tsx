import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { selectExplorerAllSelectedFilesInSortedOrder } from 'src/modules/Explorer/store/selectors';
import { VisionFile } from 'src/modules/Common/store/files/types';
import { setModelTrainingModalVisibility } from 'src/modules/Common/store/common/slice';
import { ModelTrainingModal } from 'src/modules/Common/Components/ModelTrainingModal/ModelTrainingModal';

export const ExplorerModelTrainingModalContainer = () => {
  const dispatch = useDispatch();

  const showModelTrainingModal = useSelector(
    ({ commonReducer }: RootState) => commonReducer.showModelTrainingModal
  );

  const selectedFiles: VisionFile[] = useSelector((rootState: RootState) =>
    selectExplorerAllSelectedFilesInSortedOrder(rootState)
  );

  const onCloseModelTrainingMenu = () => {
    dispatch(setModelTrainingModalVisibility(false));
  };

  return (
    <ModelTrainingModal
      showModal={showModelTrainingModal}
      selectedFiles={selectedFiles}
      onCancel={onCloseModelTrainingMenu}
    />
  );
};
