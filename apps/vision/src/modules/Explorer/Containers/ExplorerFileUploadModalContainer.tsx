import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { useThunkDispatch } from '../../../store';
import { RootState } from '../../../store/rootReducer';
import { DeleteFilesById } from '../../../store/thunks/Files/DeleteFilesById';
import { PopulateProcessFiles } from '../../../store/thunks/Process/PopulateProcessFiles';
import { getLink, workflowRoutes } from '../../../utils/workflowRoutes';
import { FileUploadModal } from '../../Common/Components/FileUploaderModal/FileUploaderModal';
import {
  addExplorerUploadedFileId,
  clearExplorerUploadedFileIds,
  setExplorerFileUploadModalVisibility,
} from '../store/slice';

export const ExplorerFileUploadModalContainer = ({
  refetch,
}: {
  refetch: () => void;
}) => {
  const dispatch = useThunkDispatch();
  const navigate = useNavigate();

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

  const deleteFileOnCDF = useCallback((fileId: number) => {
    if (fileId) {
      dispatch(DeleteFilesById({ fileIds: [fileId] }));
    }
  }, []);

  const onFinishUpload = useCallback(
    (processAfter: boolean) => {
      if (processAfter) {
        dispatch(PopulateProcessFiles(uploadedFileIds));
        navigate(getLink(workflowRoutes.process));
      }
      onCancel();
      refetch();
    },
    [navigate, uploadedFileIds, onCancel, refetch]
  );

  return (
    <FileUploadModal
      enableProcessAfter
      onUploadSuccess={onUploadSuccess}
      onFinishUpload={onFinishUpload}
      showModal={showFileUploadModal}
      onCancel={onCancel}
      deleteFileOnCDF={deleteFileOnCDF}
    />
  );
};
