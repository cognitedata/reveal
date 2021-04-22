import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { setActiveWorkflowId, getActiveWorkflowId } from 'modules/workflows';

/**
 * Takes the workflowId from the URL and sets it up as the active workflow.
 * Important for when a page is reloaded.
 * @returns workflowId: number
 */
export const useActiveWorkflow = () => {
  const dispatch = useDispatch();
  const { workflowId: workflowIdString } = useParams<{
    workflowId: string;
  }>();
  const activeWorkflowId = useSelector(getActiveWorkflowId);
  const workflowId = Number(workflowIdString);

  if (workflowId && workflowId !== activeWorkflowId) {
    dispatch(setActiveWorkflowId(workflowId));
  }

  return { workflowId };
};

// eslint-disable-next-line
// TODO: handle the situations in which the active workflow data is not present in the local storage
