import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { actions as dataModelActions } from '@platypus-app/redux/reducers/global/dataModelReducer';
import { UpdateDataModelFieldDTO } from '@platypus/platypus-core';
import { useMixpanel } from '@platypus-app/hooks/useMixpanel';

export const useTypeDefActions = () => {
  const dispatch = useDispatch();

  const parseGraphQLSchema = useCallback(
    (graphQLSchemaString: string) =>
      dispatch(dataModelActions.parseGraphQlSchema(graphQLSchemaString)),
    [dispatch]
  );

  const { track } = useMixpanel();

  const createType = useCallback(
    (typeName: string) => {
      track('UIEditor', {
        type: 'Create type',
      });
      dispatch(dataModelActions.createTypeDefsType(typeName));
    },
    [track, dispatch]
  );

  const renameType = useCallback(
    (payload: { oldName: string; newName: string }) => {
      track('UIEditor', {
        type: 'Rename type',
      });
      dispatch(dataModelActions.renameTypeDefType(payload));
    },
    [track, dispatch]
  );

  const deleteType = useCallback(
    (typeName: string) => {
      track('UIEditor', {
        type: 'Delete type',
      });
      dispatch(dataModelActions.deleteTypeDefType(typeName));
    },
    [track, dispatch]
  );

  const updateField = useCallback(
    (payload: {
      typeName: string;
      fieldName: string;
      updates: Partial<UpdateDataModelFieldDTO>;
    }) => {
      track('UIEditor', {
        type: 'Update field',
      });
      dispatch(dataModelActions.updateTypeDefField(payload));
    },
    [track, dispatch]
  );

  const createField = useCallback(
    (fieldName: string, fieldId: string) => {
      track('UIEditor', {
        type: 'Create field',
      });
      dispatch(
        dataModelActions.createTypeDefField({ id: fieldId, name: fieldName })
      );
    },
    [track, dispatch]
  );

  const removeField = useCallback(
    (fieldName: string) => {
      track('UIEditor', {
        type: 'Remove field',
      });
      dispatch(dataModelActions.removeTypeDefField(fieldName));
    },
    [track, dispatch]
  );

  return {
    parseGraphQLSchema,
    createType,
    renameType,
    deleteType,
    updateField,
    createField,
    removeField,
  };
};
