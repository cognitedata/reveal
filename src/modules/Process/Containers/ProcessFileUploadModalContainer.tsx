import { FileUploadModal } from 'src/modules/Common/Components/FileUploaderModal/FileUploaderModal';
import React from 'react';
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

  const onUploadSuccess = (fileId: number) => {
    dispatch(addProcessUploadedFileId(fileId));
  };

  const onFinishUploadAndProcess = async () => {
    dispatch(
      setProcessFileIds([
        ...processFiles.map((file) => file.id),
        ...uploadedFileIds,
      ])
    );
    dispatch(clearUploadedFiles());
  };

  return (
    <FileUploadModal
      onUploadSuccess={onUploadSuccess}
      onFinishUploadAndProcess={onFinishUploadAndProcess}
      showModal={showFileUploadModal}
      processFileCount={processFiles.length}
      onCancel={() => dispatch(setProcessViewFileUploadModalVisibility(false))}
    />
  );
};
