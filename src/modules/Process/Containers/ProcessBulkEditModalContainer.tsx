import { BulkEditModal } from 'src/modules/Common/Components/BulkEdit/BulkEditModal';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  BulkEditTempState,
  setBulkEditModalVisibility,
  setBulkEditTemp,
} from 'src/modules/Common/store/commonSlice';
import { selectAllSelectedFiles } from 'src/modules/Common/store/filesSlice';
import { RootState } from 'src/store/rootReducer';
import { updateBulk } from 'src/store/thunks/Files/updateBulk';

export const ProcessBulkEditModalContainer = () => {
  const dispatch = useDispatch();

  const selectedFiles = useSelector((state: RootState) =>
    selectAllSelectedFiles(state.filesSlice)
  );

  const showBulkEditModal = useSelector(
    ({ commonReducer }: RootState) => commonReducer.showBulkEditModal
  );
  const bulkEditTemp = useSelector(
    ({ commonReducer }: RootState) => commonReducer.bulkEditTemp
  );

  const setBulkEdit = (value: BulkEditTempState) => {
    dispatch(setBulkEditTemp(value));
  };

  const onCloseBulkEdit = () => {
    dispatch(setBulkEditModalVisibility(false));
    setBulkEdit({});
  };
  const onFinishBulkEdit = () => {
    dispatch(updateBulk({ selectedFiles, bulkEditTemp }));
    onCloseBulkEdit();
  };

  return (
    <BulkEditModal
      showModal={showBulkEditModal}
      selectedFiles={selectedFiles}
      bulkEditTemp={bulkEditTemp}
      onCancel={onCloseBulkEdit}
      setBulkEditTemp={setBulkEdit}
      onFinishBulkEdit={onFinishBulkEdit}
    />
  );
};
