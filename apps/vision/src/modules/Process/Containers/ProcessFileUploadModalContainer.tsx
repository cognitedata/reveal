import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { FileUploadModal } from '@vision/modules/Common/Components/FileUploaderModal/FileUploaderModal';
import { selectAllProcessFiles } from '@vision/modules/Process/store/selectors';
import {
  addProcessUploadedFileId,
  clearUploadedFiles,
  setProcessFileIds,
  setProcessViewFileUploadModalVisibility,
} from '@vision/modules/Process/store/slice';
import { AppDispatch } from '@vision/store';
import { RootState } from '@vision/store/rootReducer';
import { DeleteFilesById } from '@vision/store/thunks/Files/DeleteFilesById';

export const ProcessFileUploadModalContainer = () => {
  const dispatch = useDispatch<AppDispatch>();

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

  const deleteFileOnCDF = useCallback((fileId: number) => {
    if (fileId) {
      dispatch(DeleteFilesById({ fileIds: [fileId] }));
    }
  }, []);

  return (
    <FileUploadModal
      onUploadSuccess={onUploadSuccess}
      onFinishUpload={onFinishUpload}
      showModal={showFileUploadModal}
      processFileCount={processFiles.length}
      onCancel={onCancel}
      deleteFileOnCDF={deleteFileOnCDF}
    />
  );
};
