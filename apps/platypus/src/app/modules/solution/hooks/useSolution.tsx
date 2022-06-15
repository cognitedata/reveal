import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import * as solutionAsyncActions from '@platypus-app/redux/reducers/global/actions';
import { actions as solutionActions } from '@platypus-app/redux/reducers/global/dataModelReducer';
import { DataModelVersion } from '@platypus/platypus-core';

export const useSolution = () => {
  const dispatch = useDispatch();
  const fetchSolution = useCallback(
    (dataModelId: string) => {
      dispatch(solutionAsyncActions.fetchDataModel({ dataModelId }));
    },
    [dispatch]
  );

  const fetchVersions = useCallback(
    (dataModelId: string) => {
      dispatch(solutionAsyncActions.fetchVersions({ dataModelId }));
    },
    [dispatch]
  );

  const updateSchema = useCallback(
    (solutionSchema: DataModelVersion) => {
      dispatch(solutionActions.setSchema(solutionSchema));
    },
    [dispatch]
  );

  const insertSchema = useCallback(
    (solutionSchema: DataModelVersion) => {
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
