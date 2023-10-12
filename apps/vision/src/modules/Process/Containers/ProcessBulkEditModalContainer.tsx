import React from 'react';
import { useSelector } from 'react-redux';

import { useThunkDispatch } from '../../../store';
import { RootState } from '../../../store/rootReducer';
import { updateBulk } from '../../../store/thunks/Files/updateBulk';
import { BulkEditModal } from '../../Common/Components/BulkEdit/BulkEditModal';
import {
  setBulkEditModalVisibility,
  setBulkEditUnsaved,
} from '../../Common/store/common/slice';
import { BulkEditUnsavedState } from '../../Common/store/common/types';
import { selectProcessAllSelectedFilesInSortedOrder } from '../store/selectors';

export const ProcessBulkEditModalContainer = () => {
  const dispatch = useThunkDispatch();

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
