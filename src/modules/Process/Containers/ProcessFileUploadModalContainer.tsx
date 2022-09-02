import { FileUploadModal } from 'src/modules/Common/Components/FileUploaderModal/FileUploaderModal';
import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import {
  addProcessUploadedFileId,
  clearUploadedFiles,
  setProcessFileIds,
  setProcessViewFileUploadModalVisibility,
} from 'src/modules/Process/store/slice';
import { selectAllProcessFiles } from 'src/modules/Process/store/selectors';

export const ProcessFileUploadModalContainer = () => {
  const dispatch = useDispatch();

  const processFiles = useSelector((state: RootState) =>
    selectAllProcessFiles(state)
  );

  const showFileUploadModal = useSelector(
    ({ processSlice }: RootState) => processSlice.showFileUploadModal
  );

  const uploadedFileIds = useSelector(
    ({ processSlice }: RootState) => processSlice.uploadedFileIds
  );

  const onUploadSuccess = useCallback((fileId: number) => {
    dispatch(addProcessUploadedFileId(fileId));
  }, []);

  const onCancel = useCallback(() => {
    dispatch(setProcessViewFileUploadModalVisibility(false));
  }, []);

  const onFinishUpload = useCallback(async () => {
    onCancel();
    dispatch(
      setProcessFileIds([
        ...processFiles.map((file) => file.id),
        ...uploadedFileIds,
      ])
    );
    dispatch(clearUploadedFiles());
  }, [onCancel, processFiles, uploadedFileIds]);

  return (
    <FileUploadModal
      onUploadSuccess={onUploadSuccess}
      onFinishUpload={onFinishUpload}
      showModal={showFileUploadModal}
      processFileCount={processFiles.length}
      onCancel={onCancel}
    />
  );
};
