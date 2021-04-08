import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import React from 'react';
import { PrevNextNav } from 'src/pages/Workflow/components/PrevNextNav';
import { getLink, workflowRoutes } from 'src/pages/Workflow/workflowRoutes';
import { useAnnotationJobs } from 'src/store/hooks/useAnnotationJobs';
import { createLink } from '@cognite/cdf-utilities';
import { SaveAvailableAnnotations } from 'src/store/thunks/SaveAvailableAnnotations';

export const ProcessStepActionButtons = () => {
  const history = useHistory();
  const { isPollingFinished } = useAnnotationJobs();

  const dispatch = useDispatch();

  const onNextClicked = () => {
    dispatch(SaveAvailableAnnotations());
    history.push(createLink('/explore/search/file')); // data-exploration app
  };

  return (
    <PrevNextNav
      prevBtnProps={{
        onClick: () => history.push(getLink(workflowRoutes.upload)),
        disabled: !isPollingFinished,
      }}
      nextBtnProps={{
        onClick: onNextClicked,
        children: 'Complete',
        disabled: !isPollingFinished, // TODO: add check if processing has been done when state is added
        loading: !isPollingFinished,
        title: '',
      }}
    />
  );
};
