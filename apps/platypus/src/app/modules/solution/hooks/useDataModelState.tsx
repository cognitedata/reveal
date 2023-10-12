import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { DataModelVersion } from '@platypus/platypus-core';

import { actions as solutionActions } from '../../../redux/reducers/global/dataModelReducer';
import { SchemaEditorMode } from '../data-model/types';

export const useDataModelState = () => {
  const dispatch = useDispatch();

  const setCurrentTypeName = useCallback(
    (name: string | null) => {
      dispatch(solutionActions.setCurrentTypeName(name));
    },
    [dispatch]
  );

  const updateGraphQlSchema = useCallback(
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

  const setSelectedDataModelVersion = useCallback(
    (version: DataModelVersion) => {
      dispatch(solutionActions.setSelectedDataModelVersion(version));
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

  const dataModelPublished = useCallback(
    () => dispatch(solutionActions.dataModelPublished()),
    [dispatch]
  );

  return {
    setCurrentTypeName,
    setEditorMode,
    updateGraphQlSchema,
    setIsDirty,
    setSelectedDataModelVersion,
    clearState,
    parseGraphQLSchema,
    switchDataModelVersion,
    dataModelPublished,
  };
};
