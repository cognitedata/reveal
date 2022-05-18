import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import * as solutionAsyncActions from '@platypus-app/redux/reducers/global/actions';
import { actions as solutionActions } from '@platypus-app/redux/reducers/global/solutionReducer';
import { SolutionSchema } from '@platypus/platypus-core';

export const useSolution = () => {
  const dispatch = useDispatch();
  const fetchSolution = useCallback(
    (solutionId: string) => {
      dispatch(solutionAsyncActions.fetchSolution({ solutionId }));
    },
    [dispatch]
  );

  const fetchVersions = useCallback(
    (solutionId: string) => {
      dispatch(solutionAsyncActions.fetchVersions({ solutionId }));
    },
    [dispatch]
  );

  const updateSchema = useCallback(
    (solutionSchema: SolutionSchema) => {
      dispatch(solutionActions.setSchema(solutionSchema));
    },
    [dispatch]
  );

  const insertSchema = useCallback(
    (solutionSchema: SolutionSchema) => {
      dispatch(solutionActions.insertSchema(solutionSchema));
    },
    [dispatch]
  );

  const selectVersion = useCallback(
    (version: string) => {
      dispatch(solutionActions.selectVersion({ version }));
    },
    [dispatch]
  );

  return {
    fetchSolution,
    fetchVersions,
    updateSchema,
    insertSchema,
    selectVersion,
  };
};
