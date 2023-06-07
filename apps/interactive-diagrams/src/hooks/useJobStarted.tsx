import { useDispatch, useSelector } from 'react-redux';
import { getWorkflowJobs, setJobStart } from 'modules/workflows';

export const useJobStarted = () => {
  const dispatch = useDispatch();

  const jobs = useSelector(getWorkflowJobs);
  const jobStarted = jobs?.started ?? false;

  const setJobStarted = (started: boolean) => {
    dispatch(setJobStart({ started }));
  };
  return { jobStarted, setJobStarted };
};
