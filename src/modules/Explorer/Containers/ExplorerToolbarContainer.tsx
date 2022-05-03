import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { cancelFetch } from 'src/api/file/fetchFiles/fetchFiles';
import { MAX_SELECT_COUNT } from 'src/constants/ExplorerConstants';
import {
  setModelTrainingModalVisibility,
  setBulkEditModalVisibility,
  setFileDownloadModalVisibility,
} from 'src/modules/Common/store/common/slice';
import { ViewMode } from 'src/modules/Common/types';
import { RootState } from 'src/store/rootReducer';
import { PopulateProcessFiles } from 'src/store/thunks/Process/PopulateProcessFiles';
import {
  setCurrentView,
  setExplorerFileUploadModalVisibility,
  setExplorerQueryString,
} from 'src/modules/Explorer/store/slice';
import { selectExplorerSelectedFileIdsInSortedOrder } from 'src/modules/Explorer/store/selectors';
import {
  getLink,
  getParamLink,
  workflowRoutes,
} from 'src/utils/workflowRoutes';
import { PopulateReviewFiles } from 'src/store/thunks/Review/PopulateReviewFiles';
import { DeleteFilesById } from 'src/store/thunks/Files/DeleteFilesById';
import { ExplorerToolbar } from 'src/modules/Explorer/Components/ExplorerToolbar';
import { AppDispatch } from 'src/store';
import { cancelFileDetailsEdit } from 'src/modules/FileDetails/slice';

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
  const dispatch: AppDispatch = useDispatch();
  const history = useHistory();

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
      history.push(getLink(workflowRoutes.process));
    } catch (error) {
      console.error(error);
    }
  };
  const onReview = async () => {
    dispatch(PopulateReviewFiles(selectedFileIds));
    history.push(
      // selecting first item in review
      getParamLink(
        workflowRoutes.review,
        ':fileId',
        String(selectedFileIds[0])
      ),
      { from: 'explorer' }
    );
  };

  const onAutoMLModelPage = () => {
    history.push(getLink(workflowRoutes.models), { from: 'explorer' });
  };
  const onDelete = () => {
    dispatch(DeleteFilesById(selectedFileIds));
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
