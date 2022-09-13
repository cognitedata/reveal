import { FileUploadModal } from 'src/modules/Common/Components/FileUploaderModal/FileUploaderModal';
import {
  addExplorerUploadedFileId,
  clearExplorerUploadedFileIds,
  setExplorerFileUploadModalVisibility,
} from 'src/modules/Explorer/store/slice';
import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { useHistory } from 'react-router-dom';
import { PopulateProcessFiles } from 'src/store/thunks/Process/PopulateProcessFiles';
import { getLink, workflowRoutes } from 'src/utils/workflowRoutes';

export const ExplorerFileUploadModalContainer = ({
  refetch,
}: {
  refetch: () => void;
}) => {
  const dispatch = useDispatch();
  const history = useHistory();

  const showFileUploadModal = useSelector(
    ({ explorerReducer }: RootState) => explorerReducer.showFileUploadModal
  );

  const uploadedFileIds = useSelector(
    ({ explorerReducer }: RootState) => explorerReducer.uploadedFileIds
  );

  const onUploadSuccess = useCallback((fileId: number) => {
    dispatch(addExplorerUploadedFileId(fileId));
  }, []);

  const onCancel = useCallback(() => {
    dispatch(clearExplorerUploadedFileIds());
    dispatch(setExplorerFileUploadModalVisibility(false));
  }, []);

  const onFinishUpload = useCallback(
    (processAfter: boolean) => {
      if (processAfter) {
        dispatch(PopulateProcessFiles(uploadedFileIds));
        history.push(getLink(workflowRoutes.process));
      }
      onCancel();
      refetch();
    },
    [history, uploadedFileIds, onCancel, refetch]
  );

  return (
    <FileUploadModal
      enableProcessAfter
      onUploadSuccess={onUploadSuccess}
      onFinishUpload={onFinishUpload}
      showModal={showFileUploadModal}
      onCancel={onCancel}
    />
  );
};
