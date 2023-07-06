import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { FileUploadModal } from '@vision/modules/Common/Components/FileUploaderModal/FileUploaderModal';
import {
  addExplorerUploadedFileId,
  clearExplorerUploadedFileIds,
  setExplorerFileUploadModalVisibility,
} from '@vision/modules/Explorer/store/slice';
import { useThunkDispatch } from '@vision/store';
import { RootState } from '@vision/store/rootReducer';
import { DeleteFilesById } from '@vision/store/thunks/Files/DeleteFilesById';
import { PopulateProcessFiles } from '@vision/store/thunks/Process/PopulateProcessFiles';
import { getLink, workflowRoutes } from '@vision/utils/workflowRoutes';

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
