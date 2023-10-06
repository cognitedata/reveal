import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useThunkDispatch } from '../../../store';
import { RootState } from '../../../store/rootReducer';
import { ModelTrainingModal } from '../../Common/Components/ModelTrainingModal/ModelTrainingModal';
import { setModelTrainingModalVisibility } from '../../Common/store/common/slice';
import { VisionFile } from '../../Common/store/files/types';
import { selectExplorerAllSelectedFilesInSortedOrder } from '../store/selectors';

export const ExplorerModelTrainingModalContainer = () => {
  const dispatch = useThunkDispatch();

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
