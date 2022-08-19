import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { actions as dataModelActions } from '@platypus-app/redux/reducers/global/dataModelReducer';
import { UpdateDataModelFieldDTO } from '@platypus/platypus-core';
import { Mixpanel, TRACKING_TOKENS } from '@platypus-app/utils/mixpanel';

export const useTypeDefActions = () => {
  const dispatch = useDispatch();

  const parseGraphQLSchema = useCallback(
    (graphQLSchemaString: string) =>
      dispatch(dataModelActions.parseGraphQlSchema(graphQLSchemaString)),
    [dispatch]
  );

  const createType = useCallback(
    (typeName: string) => {
      Mixpanel.track(TRACKING_TOKENS.UIEditor, {
        type: 'Create type',
      });
      dispatch(dataModelActions.createTypeDefsType(typeName));
    },
    [dispatch]
  );

  const renameType = useCallback(
    (payload: { oldName: string; newName: string }) => {
      Mixpanel.track(TRACKING_TOKENS.UIEditor, {
        type: 'Rename type',
      });
      dispatch(dataModelActions.renameTypeDefType(payload));
    },
    [dispatch]
  );

  const deleteType = useCallback(
    (typeName: string) => {
      Mixpanel.track(TRACKING_TOKENS.UIEditor, {
        type: 'Delete type',
      });
      dispatch(dataModelActions.deleteTypeDefType(typeName));
    },
    [dispatch]
  );

  const updateField = useCallback(
    (payload: {
      typeName: string;
      fieldName: string;
      updates: Partial<UpdateDataModelFieldDTO>;
    }) => {
      Mixpanel.track(TRACKING_TOKENS.UIEditor, {
        type: 'Update field',
      });
      dispatch(dataModelActions.updateTypeDefField(payload));
    },
    [dispatch]
  );

  const createField = useCallback(
    (fieldName: string, fieldId: string) => {
      Mixpanel.track(TRACKING_TOKENS.UIEditor, {
        type: 'Create field',
      });
      dispatch(
        dataModelActions.createTypeDefField({ id: fieldId, name: fieldName })
      );
    },
    [dispatch]
  );

  const removeField = useCallback(
    (fieldName: string) => {
      Mixpanel.track(TRACKING_TOKENS.UIEditor, {
        type: 'Remove field',
      });
      dispatch(dataModelActions.removeTypeDefField(fieldName));
    },
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
