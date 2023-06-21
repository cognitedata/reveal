import { BulkEditModal } from 'src/modules/Common/Components/BulkEdit/BulkEditModal';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { selectExplorerAllSelectedFilesInSortedOrder } from 'src/modules/Explorer/store/selectors';
import { VisionFile } from 'src/modules/Common/store/files/types';
import {
  setBulkEditModalVisibility,
  setBulkEditUnsaved,
} from 'src/modules/Common/store/common/slice';

import { BulkEditUnsavedState } from 'src/modules/Common/store/common/types';
import { updateBulk } from 'src/store/thunks/Files/updateBulk';

export const ExplorerBulkEditModalContainer = () => {
  const dispatch = useDispatch();

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
