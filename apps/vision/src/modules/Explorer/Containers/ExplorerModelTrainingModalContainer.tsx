import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ModelTrainingModal } from '@vision/modules/Common/Components/ModelTrainingModal/ModelTrainingModal';
import { setModelTrainingModalVisibility } from '@vision/modules/Common/store/common/slice';
import { VisionFile } from '@vision/modules/Common/store/files/types';
import { selectExplorerAllSelectedFilesInSortedOrder } from '@vision/modules/Explorer/store/selectors';
import { AppDispatch } from '@vision/store';
import { RootState } from '@vision/store/rootReducer';

export const ExplorerModelTrainingModalContainer = () => {
  const dispatch = useDispatch<AppDispatch>();

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
