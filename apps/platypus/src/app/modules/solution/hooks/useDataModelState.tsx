import { actions as solutionActions } from '@platypus-app/redux/reducers/global/dataModelReducer';
import { BuiltInType } from '@platypus/platypus-core';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

export const useDataModelState = () => {
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
      dispatch(solutionActions.parseGraphQlSchema(graphQlSchema));
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

  const setBuiltInTypes = useCallback(
    (builtInTypes: BuiltInType[]) => {
      dispatch(solutionActions.setBuiltInTypes(builtInTypes));
    },
    [dispatch]
  );

  const clearState = useCallback(() => {
    dispatch(solutionActions.clearState());
  }, [dispatch]);

  const parseGraphQLSchema = useCallback(
    (graphQLSchemaString: string) =>
      dispatch(solutionActions.parseGraphQlSchema(graphQLSchemaString)),
    [dispatch]
  );

  return {
    setCurrentTypeName,
    setDataModelFieldErrors,
    setGraphQlSchema,
    setIsDirty,
    setSelectedVersionNumber,
    setBuiltInTypes,
    clearState,
    parseGraphQLSchema,
  };
};
