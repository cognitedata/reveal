import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { cancelFetch } from '@vision/api/file/fetchFiles/fetchFiles';
import { MAX_SELECT_COUNT } from '@vision/constants/ExplorerConstants';
import {
  setModelTrainingModalVisibility,
  setBulkEditModalVisibility,
  setFileDownloadModalVisibility,
} from '@vision/modules/Common/store/common/slice';
import { ViewMode } from '@vision/modules/Common/types';
import { ExplorerToolbar } from '@vision/modules/Explorer/Components/ExplorerToolbar';
import { selectExplorerSelectedFileIdsInSortedOrder } from '@vision/modules/Explorer/store/selectors';
import {
  setCurrentView,
  setExplorerFileUploadModalVisibility,
  setExplorerQueryString,
} from '@vision/modules/Explorer/store/slice';
import { cancelFileDetailsEdit } from '@vision/modules/FileDetails/slice';
import { useThunkDispatch } from '@vision/store';
import { RootState } from '@vision/store/rootReducer';
import { DeleteFilesById } from '@vision/store/thunks/Files/DeleteFilesById';
import { PopulateProcessFiles } from '@vision/store/thunks/Process/PopulateProcessFiles';
import { PopulateReviewFiles } from '@vision/store/thunks/Review/PopulateReviewFiles';
import {
  getLink,
  getParamLink,
  workflowRoutes,
} from '@vision/utils/workflowRoutes';

export type ExplorerToolbarContainerProps = {
  query?: string;
  selectedCount?: number;
  isLoading: boolean;
  currentView?: string;
  reFetch: () => void;
};

export const ExplorerToolbarContainer = (
  props: ExplorerToolbarContainerProps
) => {
  const dispatch = useThunkDispatch();
  const navigate = useNavigate();

  const percentageScanned = useSelector(
    ({ explorerReducer }: RootState) => explorerReducer.percentageScanned
  );
  const selectedFileIds = useSelector((state: RootState) =>
    selectExplorerSelectedFileIdsInSortedOrder(state)
  );

  const handleViewChange = (view: string) => {
    dispatch(setCurrentView(view as ViewMode));
  };
  const handleSearch = (text: string) => {
    cancelFetch();
    dispatch(setExplorerQueryString(text));
  };
  const onUpload = () => {
    dispatch(setExplorerFileUploadModalVisibility(true));
  };
  const onDownload = () => {
    dispatch(setFileDownloadModalVisibility(true));
  };

  const onTrainModel = () => {
    dispatch(setModelTrainingModalVisibility(true));
  };
  const onContextualise = async () => {
    try {
      await dispatch(PopulateProcessFiles(selectedFileIds)).unwrap();
      navigate(getLink(workflowRoutes.process));
    } catch (error) {
      console.error(error);
    }
  };
  const onReview = async () => {
    dispatch(PopulateReviewFiles(selectedFileIds));
    navigate(
      // selecting first item in review
      getParamLink(workflowRoutes.review, ':fileId', String(selectedFileIds[0]))
    );
  };

  const onAutoMLModelPage = () => {
    navigate(getLink(workflowRoutes.models));
  };
  const onDelete = (setIsDeletingState: (val: boolean) => void) => {
    dispatch(
      DeleteFilesById({
        fileIds: selectedFileIds,
        setIsDeletingState,
      })
    );
  };
  const onBulkEdit = () => {
    dispatch(setBulkEditModalVisibility(true));
  };

  const handleCancelOtherEdits = () => {
    dispatch(cancelFileDetailsEdit());
  };

  return (
    <ExplorerToolbar
      {...props}
      maxSelectCount={MAX_SELECT_COUNT}
      percentageScanned={percentageScanned}
      onViewChange={handleViewChange}
      onSearch={handleSearch}
      onUpload={onUpload}
      onDownload={onDownload}
      onContextualise={onContextualise}
      onReview={onReview}
      onDelete={onDelete}
      onBulkEdit={onBulkEdit}
      onTrainModel={onTrainModel}
      onAutoMLModelPage={onAutoMLModelPage}
      handleCancelOtherEdits={handleCancelOtherEdits}
    />
  );
};
