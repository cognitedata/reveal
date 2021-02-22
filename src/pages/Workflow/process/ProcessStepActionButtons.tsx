import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import React, { useState } from 'react';
import { detectAnnotations } from 'src/store/processSlice';
import { PrevNextNav } from 'src/pages/Workflow/components/PrevNextNav';
import { getLink, workflowRoutes } from 'src/pages/Workflow/workflowRoutes';
import { useAnnotationJobs } from 'src/store/hooks/useAnnotationJobs';
import { createLink } from '@cognite/cdf-utilities';

export const ProcessStepActionButtons = () => {
  const history = useHistory();
  const { isPollingFinished } = useAnnotationJobs();

  const [detectBtnClicked, setDetectBtnClicked] = useState(false);

  const dispatch = useDispatch();

  const onNextClicked = () => {
    if (isPollingFinished) {
      history.push(createLink('/explore/search/file')); // data-exploration app
    } else {
      setDetectBtnClicked(true);
      dispatch(detectAnnotations());
    }
  };

  const nextBtnTitle = isPollingFinished ? 'Complete' : 'Detect';
  const nextBtnDisabled = detectBtnClicked && !isPollingFinished;

  return (
    <PrevNextNav
      prevBtnProps={{
        onClick: () => history.push(getLink(workflowRoutes.upload)),
      }}
      nextBtnProps={{
        onClick: onNextClicked,
        children: nextBtnTitle,
        disabled: nextBtnDisabled,
        loading: nextBtnDisabled,
      }}
    />
  );
};
