import { actions as solutionActions } from '@platypus-app/redux/reducers/global/dataModelReducer';
import { DataModelVersion } from '@platypus/platypus-core';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

export const useSolution = () => {
  const dispatch = useDispatch();

  const updateSchema = useCallback(
    (solutionSchema: DataModelVersion) => {
      dispatch(solutionActions.setVersion(solutionSchema));
    },
    [dispatch]
  );

  const insertSchema = useCallback(
    (solutionSchema: DataModelVersion) => {
      dispatch(solutionActions.insertVersion(solutionSchema));
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
    updateSchema,
    insertSchema,
    selectVersion,
  };
};
