import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import * as solutionActions from '../../../redux/reducers/global/actions';

export const useSolution = () => {
  const dispatch = useDispatch();
  const fetchSolution = useCallback(
    (solutionId: string) => {
      dispatch(solutionActions.fetchSolution({ solutionId }));
    },
    [dispatch]
  );

  const fetchVersions = useCallback(
    (solutionId: string) => {
      dispatch(solutionActions.fetchVersions({ solutionId }));
    },
    [dispatch]
  );
  return {
    fetchSolution,
    fetchVersions,
  };
};
