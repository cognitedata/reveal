import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { BulkEditModal } from '@vision/modules/Common/Components/BulkEdit/BulkEditModal';
import {
  setBulkEditModalVisibility,
  setBulkEditUnsaved,
} from '@vision/modules/Common/store/common/slice';
import { BulkEditUnsavedState } from '@vision/modules/Common/store/common/types';
import { VisionFile } from '@vision/modules/Common/store/files/types';
import { selectExplorerAllSelectedFilesInSortedOrder } from '@vision/modules/Explorer/store/selectors';
import { AppDispatch } from '@vision/store';
import { RootState } from '@vision/store/rootReducer';
import { updateBulk } from '@vision/store/thunks/Files/updateBulk';

export const ExplorerBulkEditModalContainer = () => {
  const dispatch = useDispatch<AppDispatch>();

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
