import { actions as solutionActions } from '@platypus-app/redux/reducers/global/dataModelReducer';
import { BuiltInType, DataModelVersion } from '@platypus/platypus-core';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { SchemaEditorMode } from '../data-model/types';

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
    (graphQlSchema: string) => {
      dispatch(solutionActions.setGraphQlSchema(graphQlSchema));
      dispatch(solutionActions.parseGraphQlSchema(graphQlSchema));
    },
    [dispatch]
  );

  const setIsDirty = useCallback(
    (isDirty: boolean) => {
      dispatch(solutionActions.setIsDirty(isDirty));
    },
    [dispatch]
  );

  const setEditorMode = useCallback(
    (editorMode: SchemaEditorMode) => {
      dispatch(solutionActions.setEditorMode(editorMode));
    },
    [dispatch]
  );

  const setSelectedVersionNumber = useCallback(
    (versionNumber: string) => {
      dispatch(solutionActions.setSelectedVersionNumber(versionNumber));
    },
    [dispatch]
  );

  const setSelectedDataModelVersion = useCallback(
    (version: DataModelVersion) => {
      dispatch(solutionActions.setSelectedDataModelVersion(version));
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

  const switchDataModelVersion = useCallback(
    (dataModelVersion: DataModelVersion) =>
      dispatch(solutionActions.switchDataModelVersion(dataModelVersion)),
    [dispatch]
  );

  return {
    setCurrentTypeName,
    setDataModelFieldErrors,
    setEditorMode,
    setGraphQlSchema,
    setIsDirty,
    setSelectedVersionNumber,
    setSelectedDataModelVersion,
    setBuiltInTypes,
    clearState,
    parseGraphQLSchema,
    switchDataModelVersion,
  };
};
