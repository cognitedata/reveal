import { BulkEditModal } from 'src/modules/Common/Components/BulkEdit/BulkEditModal';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setBulkEditModalVisibility,
  setBulkEditUnsaved,
} from 'src/modules/Common/store/common/slice';

import { BulkEditUnsavedState } from 'src/modules/Common/store/common/types';
import { RootState } from 'src/store/rootReducer';
import { updateBulk } from 'src/store/thunks/Files/updateBulk';
import { selectProcessAllSelectedFilesInSortedOrder } from 'src/modules/Process/processSlice';

export const ProcessBulkEditModalContainer = () => {
  const dispatch = useDispatch();

  const selectedFiles = useSelector((state: RootState) =>
    selectProcessAllSelectedFilesInSortedOrder(state)
  );

  const showBulkEditModal = useSelector(
    ({ commonReducer }: RootState) => commonReducer.showBulkEditModal
  );
  const bulkEditUnsaved = useSelector(
    ({ commonReducer }: RootState) => commonReducer.bulkEditUnsavedState
  );

  const setBulkEdit = (value: BulkEditUnsavedState) => {
    dispatch(setBulkEditUnsaved(value));
  };

  const onCloseBulkEdit = () => {
    dispatch(setBulkEditModalVisibility(false));
    setBulkEdit({});
  };
  const onFinishBulkEdit = () => {
    dispatch(updateBulk({ selectedFiles, bulkEditUnsaved }));
    onCloseBulkEdit();
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
