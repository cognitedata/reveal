import { BulkEditModal } from 'src/modules/Common/Components/BulkEdit/BulkEditModal';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { selectExplorerAllSelectedFiles } from 'src/modules/Explorer/store/explorerSlice';
import { updateBulk } from 'src/store/thunks/updateBulk';
import { FileState } from 'src/modules/Common/filesSlice';
import isEqual from 'lodash-es/isEqual';
import {
  BulkEditTempState,
  setBulkEditModalVisibility,
  setBulkEditTemp,
} from 'src/modules/Common/commonSlice';

export const ExplorerBulkEditModalContainer = () => {
  const dispatch = useDispatch();

  const showBulkEditModal = useSelector(
    ({ commonReducer }: RootState) => commonReducer.showBulkEditModal
  );

  const selectedFiles: FileState[] = useSelector(
    ({ explorerReducer }: RootState) => {
      return selectExplorerAllSelectedFiles(explorerReducer);
    },
    isEqual
  );
  const bulkEditTemp = useSelector(
    ({ commonReducer }: RootState) => commonReducer.bulkEditTemp
  );

  const setBulkEdit = (value: BulkEditTempState) => {
    dispatch(setBulkEditTemp(value));
  };
  const onFinishBulkEdit = () => {
    dispatch(updateBulk({ selectedFiles, bulkEditTemp }));
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
      bulkEditTemp={bulkEditTemp}
      onCancel={onCloseBulkEdit}
      setBulkEditTemp={setBulkEdit}
      onFinishBulkEdit={onFinishBulkEdit}
    />
  );
};
