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

  const setCurrentTypeName = useCallback(
    (name: string | null) => {
      dispatch(solutionActions.setCurrentTypeName(name));
    },
    [dispatch]
  );

  const setDataModelFieldErrors = useCallback(
    (fieldName: string, message: string) => {
      dispatch(
        solutionActions.setTypeFieldErrors({ fieldName, error: message })
      );
    },
    [dispatch]
  );

  const setGraphQlSchema = useCallback(
    (graphQlSchema) => {
      dispatch(solutionActions.setGraphQlSchema(graphQlSchema));
    },
    [dispatch]
  );

  const setIsDirty = useCallback(
    (isDirty) => {
      dispatch(solutionActions.setIsDirty(isDirty));
    },
    [dispatch]
  );

  return {
    updateSchema,
    insertSchema,
    selectVersion,
    setCurrentTypeName,
    setDataModelFieldErrors,
    setGraphQlSchema,
    setIsDirty,
  };
};
