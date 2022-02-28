import { FileUploadModal } from 'src/modules/Common/Components/FileUploaderModal/FileUploaderModal';
import {
  addExplorerUploadedFileId,
  clearExplorerUploadedFileIds,
  setExplorerFileUploadModalVisibility,
} from 'src/modules/Explorer/store/slice';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { useHistory } from 'react-router-dom';
import { PopulateProcessFiles } from 'src/store/thunks/Process/PopulateProcessFiles';
import { getLink, workflowRoutes } from 'src/utils/workflowRoutes';

export const ExplorerFileUploadModalContainer = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const showFileUploadModal = useSelector(
    ({ explorerReducer }: RootState) => explorerReducer.showFileUploadModal
  );

  const uploadedFileIds = useSelector(
    ({ explorerReducer }: RootState) => explorerReducer.uploadedFileIds
  );

  const onUploadSuccess = (fileId: number) => {
    dispatch(addExplorerUploadedFileId(fileId));
  };

  const onFinishUploadAndProcess = () => {
    dispatch(PopulateProcessFiles(uploadedFileIds));
    dispatch(clearExplorerUploadedFileIds());
    history.push(getLink(workflowRoutes.process));
  };

  return (
    <FileUploadModal
      enableProcessAfter
      onUploadSuccess={onUploadSuccess}
      onFinishUploadAndProcess={onFinishUploadAndProcess}
      showModal={showFileUploadModal}
      onCancel={() => dispatch(setExplorerFileUploadModalVisibility(false))}
    />
  );
};
