import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import React, { useState } from 'react';
import { detectAnnotations } from 'src/store/processSlice';
import { PrevNextNav } from 'src/pages/Workflow/components/PrevNextNav';
import { getLink, workflowRoutes } from 'src/pages/Workflow/workflowRoutes';
import { useAnnotationJobs } from 'src/store/hooks/useAnnotationJobs';

export const ProcessStepActionButtons = () => {
  const history = useHistory();
  const { isPollingFinished } = useAnnotationJobs();

  const [detectBtnClicked, setDetectBtnClicked] = useState(false);

  const dispatch = useDispatch();

  const onNextClicked = () => {
    if (isPollingFinished) {
      history.push(getLink(workflowRoutes.review));
    } else {
      setDetectBtnClicked(true);
      dispatch(detectAnnotations());
    }
  };

  const titleNext = isPollingFinished ? 'Review' : 'Detect';

  return (
    <PrevNextNav
      onPrevClicked={() => history.push(getLink(workflowRoutes.upload))}
      onNextClicked={onNextClicked}
      titleNext={titleNext}
      disableNext={detectBtnClicked && !isPollingFinished}
    />
  );
};
