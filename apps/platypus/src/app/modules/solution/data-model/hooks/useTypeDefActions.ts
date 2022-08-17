import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { actions as dataModelActions } from '@platypus-app/redux/reducers/global/dataModelReducer';
import { UpdateDataModelFieldDTO } from '@platypus/platypus-core';

export const useTypeDefActions = () => {
  const dispatch = useDispatch();

  const parseGraphQLSchema = useCallback(
    (graphQLSchemaString: string) =>
      dispatch(dataModelActions.parseGraphQlSchema(graphQLSchemaString)),
    [dispatch]
  );

  const createType = useCallback(
    (typeName: string) =>
      dispatch(dataModelActions.createTypeDefsType(typeName)),
    [dispatch]
  );

  const renameType = useCallback(
    (payload: { oldName: string; newName: string }) =>
      dispatch(dataModelActions.renameTypeDefType(payload)),
    [dispatch]
  );

  const deleteType = useCallback(
    (typeName: string) =>
      dispatch(dataModelActions.deleteTypeDefType(typeName)),
    [dispatch]
  );

  const updateField = useCallback(
    (payload: {
      typeName: string;
      fieldName: string;
      updates: Partial<UpdateDataModelFieldDTO>;
    }) => dispatch(dataModelActions.updateTypeDefField(payload)),
    [dispatch]
  );

  const createField = useCallback(
    (fieldName: string, fieldId: string) =>
      dispatch(
        dataModelActions.createTypeDefField({ id: fieldId, name: fieldName })
      ),
    [dispatch]
  );

  const removeField = useCallback(
    (fieldName: string) =>
      dispatch(dataModelActions.removeTypeDefField(fieldName)),
    [dispatch]
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
