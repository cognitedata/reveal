import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import React from 'react';
import { PrevNextNav } from 'src/pages/Workflow/components/PrevNextNav';
import { getLink, workflowRoutes } from 'src/pages/Workflow/workflowRoutes';
import { createLink } from '@cognite/cdf-utilities';
import { SaveAvailableAnnotations } from 'src/store/thunks/SaveAvailableAnnotations';
import { RootState } from 'src/store/rootReducer';
import { selectIsPollingComplete } from 'src/store/processSlice';

export const ProcessStepActionButtons = () => {
  const history = useHistory();
  const isPollingFinished = useSelector((state: RootState) => {
    return selectIsPollingComplete(state.processSlice);
  });

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
