import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { BulkEditModal } from '@vision/modules/Common/Components/BulkEdit/BulkEditModal';
import {
  setBulkEditModalVisibility,
  setBulkEditUnsaved,
} from '@vision/modules/Common/store/common/slice';
import { BulkEditUnsavedState } from '@vision/modules/Common/store/common/types';
import { selectProcessAllSelectedFilesInSortedOrder } from '@vision/modules/Process/store/selectors';
import { AppDispatch } from '@vision/store';
import { RootState } from '@vision/store/rootReducer';
import { updateBulk } from '@vision/store/thunks/Files/updateBulk';

export const ProcessBulkEditModalContainer = () => {
  const dispatch = useDispatch<AppDispatch>();

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
