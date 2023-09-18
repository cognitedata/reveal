import { useDispatch, useSelector } from 'react-redux';

import {
  getActiveWorkflowId,
  getWorkflowJobs,
  setJobStart,
  useWorkflowLoadPercentages,
} from '../modules/workflows';

export const useJobStarted = () => {
  const dispatch = useDispatch();

  const jobs = useSelector(getWorkflowJobs);
  const jobStarted = jobs?.started ?? false;

  const setJobStarted = (started: boolean) => {
    dispatch(setJobStart({ started }));
  };
  const activeWorkflowId = useSelector(getActiveWorkflowId);

  const { isLoaded, totalCount } = useWorkflowLoadPercentages(
    activeWorkflowId,
    'assets'
  );

  return {
    jobStarted,
    setJobStarted,
    assetsLoaded: isLoaded || totalCount === 0,
  };
};
