import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import isNumber from 'lodash/isNumber';
import { useLoadStepOnMount } from 'hooks';
import {
  setActiveWorkflowId,
  getActiveWorkflowId,
  WorkflowStep,
} from 'modules/workflows';

// eslint-disable-next-line
// TODO: handle the situations in which the active workflow data is not present in the local storage

/**
 * Takes the workflowId from the URL and sets it up as the active workflow.
 * Important for when a page is reloaded (which is why "step" is taken
 * as argument - when the page is reloaded, the active step must be updated)
 * @returns workflowId: number
 */
export const useActiveWorkflow = (step?: WorkflowStep) => {
  const dispatch = useDispatch();
  const { workflowId: workflowIdString } = useParams<{
    workflowId: string;
  }>();
  const activeWorkflowId = useSelector(getActiveWorkflowId);
  const workflowId = Number(workflowIdString);

  useEffect(() => {
    if (workflowId && workflowId !== activeWorkflowId && isNumber(workflowId)) {
      dispatch(setActiveWorkflowId(workflowId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWorkflowId, workflowId]);

  useLoadStepOnMount(step);

  return { workflowId };
};
