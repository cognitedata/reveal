import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';

import { useThunkDispatch } from '../../../store';
import { RootState } from '../../../store/rootReducer';
import { DeleteFilesById } from '../../../store/thunks/Files/DeleteFilesById';
import { FileUploadModal } from '../../Common/Components/FileUploaderModal/FileUploaderModal';
import { selectAllProcessFiles } from '../store/selectors';
import {
  addProcessUploadedFileId,
  clearUploadedFiles,
  setProcessFileIds,
  setProcessViewFileUploadModalVisibility,
} from '../store/slice';

export const ProcessFileUploadModalContainer = () => {
  const dispatch = useThunkDispatch();

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
