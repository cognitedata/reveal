import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import React, { useState } from 'react';
import { detectAnnotations } from 'src/store/processSlice';
import { PrevNextNav } from 'src/pages/Workflow/components/PrevNextNav';
import { getLink, workflowRoutes } from 'src/pages/Workflow/workflowRoutes';
import { useAnnotationJobs } from 'src/store/hooks/useAnnotationJobs';
import { createLink } from '@cognite/cdf-utilities';
import { RootState } from 'src/store/rootReducer';
import { message } from 'antd';
import { selectAllFiles } from 'src/store/uploadedFilesSlice';

export const ProcessStepActionButtons = () => {
  const history = useHistory();
  const { isPollingFinished } = useAnnotationJobs();
  const selectedDetectionModels = useSelector(
    (state: RootState) => state.processSlice.selectedDetectionModels
  );
  const uploadedFiles = useSelector((state: RootState) =>
    selectAllFiles(state.uploadedFiles)
  );

  const [detectBtnClicked, setDetectBtnClicked] = useState(false);

  const dispatch = useDispatch();

  const onNextClicked = () => {
    if (isPollingFinished) {
      history.push(createLink('/explore/search/file')); // data-exploration app
    } else {
      if (!selectedDetectionModels.length) {
        message.error('Please select ML models to use for detection');
        return;
      }
      setDetectBtnClicked(true);
      dispatch(
        detectAnnotations({
          fileIds: uploadedFiles.map(({ id }) => id),
          detectionModels: selectedDetectionModels,
        })
      );
    }
  };

  const nextBtnTitle = isPollingFinished ? 'Complete' : 'Detect';
  const nextBtnIsLoading = detectBtnClicked && !isPollingFinished;

  return (
    <PrevNextNav
      prevBtnProps={{
        onClick: () => history.push(getLink(workflowRoutes.upload)),
      }}
      nextBtnProps={{
        onClick: onNextClicked,
        children: nextBtnTitle,
        disabled: nextBtnIsLoading,
        loading: nextBtnIsLoading,
      }}
    />
  );
};
