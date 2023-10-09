import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useThunkDispatch } from '../../../store';
import { RootState } from '../../../store/rootReducer';
import { updateBulk } from '../../../store/thunks/Files/updateBulk';
import { BulkEditModal } from '../../Common/Components/BulkEdit/BulkEditModal';
import {
  setBulkEditModalVisibility,
  setBulkEditUnsaved,
} from '../../Common/store/common/slice';
import { BulkEditUnsavedState } from '../../Common/store/common/types';
import { VisionFile } from '../../Common/store/files/types';
import { selectExplorerAllSelectedFilesInSortedOrder } from '../store/selectors';

export const ExplorerBulkEditModalContainer = () => {
  const dispatch = useThunkDispatch();

  const showBulkEditModal = useSelector(
    ({ commonReducer }: RootState) => commonReducer.showBulkEditModal
  );

  const selectedFiles: VisionFile[] = useSelector((rootState: RootState) =>
    selectExplorerAllSelectedFilesInSortedOrder(rootState)
  );
  const bulkEditUnsaved = useSelector(
    ({ commonReducer }: RootState) => commonReducer.bulkEditUnsavedState
  );

  const setBulkEdit = (value: BulkEditUnsavedState) => {
    dispatch(setBulkEditUnsaved(value));
  };
  const onFinishBulkEdit = () => {
    dispatch(updateBulk({ selectedFiles, bulkEditUnsaved }));
    onCloseBulkEdit();
  };
  const onCloseBulkEdit = () => {
    dispatch(setBulkEditModalVisibility(false));
    setBulkEdit({});
  };

  return (
    <BulkEditModal
      showModal={showBulkEditModal}
      selectedFiles={selectedFiles}
      bulkEditUnsaved={bulkEditUnsaved}
      onCancel={onCloseBulkEdit}
      setBulkEditUnsaved={setBulkEdit}
      onFinishBulkEdit={onFinishBulkEdit}
    />
  );
};
