import { actions as solutionActions } from '@platypus-app/redux/reducers/global/dataModelReducer';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

export const useSolution = () => {
  const dispatch = useDispatch();

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

  const setSelectedVersionNumber = useCallback(
    (versionNumber: string) => {
      dispatch(solutionActions.setSelectedVersionNumber(versionNumber));
    },
    [dispatch]
  );

  return {
    setCurrentTypeName,
    setDataModelFieldErrors,
    setGraphQlSchema,
    setIsDirty,
    setSelectedVersionNumber,
  };
};
