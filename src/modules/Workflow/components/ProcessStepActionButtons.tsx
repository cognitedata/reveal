import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import React from 'react';
import { PrevNextNav } from 'src/modules/Workflow/components/PrevNextNav';
import { getLink, workflowRoutes } from 'src/modules/Workflow/workflowRoutes';
import { createLink } from '@cognite/cdf-utilities';
import { SaveAvailableAnnotations } from 'src/store/thunks/SaveAvailableAnnotations';
import { RootState } from 'src/store/rootReducer';
import { selectIsPollingComplete } from 'src/modules/Process/processSlice';
import { annotationsById } from 'src/modules/Preview/previewSlice';

export const ProcessStepActionButtons = () => {
  const history = useHistory();
  const isPollingFinished = useSelector((state: RootState) => {
    return selectIsPollingComplete(state.processSlice);
  });

  const { allFilesStatus } = useSelector(
    (state: RootState) => state.uploadedFiles
  );

  const annotations = useSelector((state: RootState) => {
    return annotationsById(state.previewSlice);
  });

  const dispatch = useDispatch();

  const onNextClicked = () => {
    dispatch(SaveAvailableAnnotations());
    history.push(createLink('/explore/search/file')); // data-exploration app
  };

  const disableComplete =
    !isPollingFinished || !Object.keys(annotations).length;

  return (
    <PrevNextNav
      prevBtnProps={{
        onClick: () => history.push(getLink(workflowRoutes.upload)),
        disabled: !isPollingFinished,
      }}
      nextBtnProps={{
        onClick: onNextClicked,
        children: 'Finish processing',
        disabled: disableComplete,
        title: '',
      }}
      skipBtnProps={{
        disabled:
          !isPollingFinished ||
          !allFilesStatus ||
          !!Object.keys(annotations).length,
      }}
    />
  );
};
