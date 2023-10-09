/* eslint-disable no-param-reassign */
import {
  DataModelTypeDefs,
  DataModelTypeDefsType,
  DataModelVersion,
  DataModelVersionStatus,
  UpdateDataModelFieldDTO,
} from '@platypus/platypus-core';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { rootInjector, TOKENS } from '../../../di';
import { SchemaEditorMode } from '../../../modules/solution/data-model/types';

export interface DataModelReducerState {
  currentTypeName: null | string;
  editorMode: SchemaEditorMode;
  graphQlSchema: string;
  isDirty: boolean;
  typeDefs: DataModelTypeDefs;
  selectedDataModelVersion?: DataModelVersion;
  hasError: boolean;
}
const getTypeDefsBuilder = () =>
  rootInjector.get(TOKENS.dataModelTypeDefsBuilderService);

export const initialState = {
  currentTypeName: null as null | string,
  editorMode: SchemaEditorMode.View,
  graphQlSchema: '',
  isDirty: false,
  typeDefs: { types: [] } as DataModelTypeDefs,
  hasError: false,
} as DataModelReducerState;

const updateDataModelState = (
  state: DataModelReducerState
): DataModelReducerState => {
  const typeDefsBuilder = getTypeDefsBuilder();
  const updatedGqlSchema = typeDefsBuilder.buildSchemaString();
  state.graphQlSchema = updatedGqlSchema;

  const validationErrors = typeDefsBuilder.validate(updatedGqlSchema);

  state.hasError = validationErrors.length > 0;

  return state;
};

const clearState = (state: DataModelReducerState): DataModelReducerState => {
  const typeDefsBuilder = getTypeDefsBuilder();
  typeDefsBuilder.clear();
  state.isDirty = false;
  state.graphQlSchema = '';
  state.typeDefs = { types: [] };
  state.currentTypeName = null;
  state.hasError = false;
  state.editorMode = SchemaEditorMode.View;
  delete state.selectedDataModelVersion;
  return state;
};

const dataModelSlice = createSlice({
  name: 'data-model',
  initialState: initialState,
  reducers: {
    setCurrentTypeName: (state, action: PayloadAction<string | null>) => {
      state.currentTypeName = action.payload;
    },
    setGraphQlSchema: (state, action: PayloadAction<string>) => {
      state.graphQlSchema = action.payload;
    },
    setIsDirty: (state, action: PayloadAction<boolean>) => {
      state.isDirty = action.payload;
    },
    setEditorMode: (state, action: PayloadAction<SchemaEditorMode>) => {
      state.editorMode = action.payload;
    },
    setSelectedDataModelVersion: (
      state,
      action: PayloadAction<DataModelVersion>
    ) => {
      state.selectedDataModelVersion = action.payload;
    },
    parseGraphQlSchema: (state, action: PayloadAction<string>) => {
      const graphQlSchemaString = action.payload;
      const typeDefsBuilder = getTypeDefsBuilder();
      const validationErrors = typeDefsBuilder.validate(graphQlSchemaString);

      const hasError = validationErrors.length > 0;
      state.hasError = hasError;

      try {
        const parsedTypeDefs = typeDefsBuilder.parseSchema(
          graphQlSchemaString,
          // creating a new data model, there is no view info yet
          []
        );
        state.typeDefs = parsedTypeDefs;
      } catch (err) {
        state.hasError = !!err;
      }
    },
    createTypeDefsType: (state, action: PayloadAction<string>) => {
      const typeDefsBuilder = getTypeDefsBuilder();

      const typeName = action.payload;
      const capitalizedTypeName =
        typeName.charAt(0).toUpperCase() + typeName.slice(1);

      const dataModelWithNewType = typeDefsBuilder.addType(
        state.typeDefs,
        capitalizedTypeName
      );

      const updatedType = dataModelWithNewType.types.find(
        (type) => type.name === typeName
      ) as DataModelTypeDefsType;

      state.typeDefs = dataModelWithNewType;
      state.currentTypeName = updatedType.name;
      updateDataModelState(state);
    },
    updateTypeDefField: (
      state,
      action: PayloadAction<{
        typeName: string;
        fieldName: string;
        updates: Partial<UpdateDataModelFieldDTO>;
      }>
    ) => {
      const typeDefsBuilder = getTypeDefsBuilder();
      const { typeName, fieldName, updates } = action.payload;
      state.typeDefs = typeDefsBuilder.updateField(
        state.typeDefs,
        typeName,
        fieldName,
        updates
      );
      updateDataModelState(state);
    },
    createTypeDefField: (
      state,
      action: PayloadAction<{ name: string; id: string }>
    ) => {
      const fieldName = action.payload.name;
      const fieldID = action.payload.id;
      const typeDefsBuilder = getTypeDefsBuilder();
      state.typeDefs = typeDefsBuilder.addField(
        state.typeDefs,
        // eslint-disable-next-line
        state.currentTypeName!,
        fieldName,
        {
          id: fieldID,
          name: fieldName,
          type: 'String',
        }
      );
      updateDataModelState(state);
    },
    removeTypeDefField: (state, action: PayloadAction<string>) => {
      const fieldName = action.payload;
      const typeDefsBuilder = getTypeDefsBuilder();
      state.typeDefs = typeDefsBuilder.removeField(
        state.typeDefs,
        // eslint-disable-next-line
        state.currentTypeName!,
        fieldName
      );
      updateDataModelState(state);
    },
    renameTypeDefType: (
      state,
      action: PayloadAction<{ oldName: string; newName: string }>
    ) => {
      const { oldName, newName } = action.payload;
      const typeDefsBuilder = getTypeDefsBuilder();
      state.typeDefs = typeDefsBuilder.renameType(
        state.typeDefs,
        oldName,
        newName
      );
      updateDataModelState(state);
    },
    deleteTypeDefType: (state, action: PayloadAction<string>) => {
      const typeName = action.payload;
      const typeDefsBuilder = getTypeDefsBuilder();
      state.typeDefs = typeDefsBuilder.removeType(state.typeDefs, typeName);
      updateDataModelState(state);
    },
    switchDataModelVersion: (
      state,
      action: PayloadAction<DataModelVersion>
    ) => {
      // START copy pasted from the parseGraphQlSchema reducer
      // should be refactored to DRY this up and use redux action/reducer better
      const graphQlSchemaString = action.payload.schema;
      const typeDefsBuilder = getTypeDefsBuilder();

      // this line not copy-pasted
      typeDefsBuilder.clear();

      const validationErrors = typeDefsBuilder.validate(graphQlSchemaString);

      const hasError = validationErrors.length > 0;
      state.hasError = hasError;

      try {
        const parsedTypeDefs = typeDefsBuilder.parseSchema(
          graphQlSchemaString,
          action.payload.views
        );
        state.typeDefs = parsedTypeDefs;
      } catch (err) {
        state.hasError = !!err;
      }
      // END copy pasted from the parseGraphQlSchema reducer

      state.graphQlSchema = action.payload.schema;
      state.isDirty = action.payload.status === DataModelVersionStatus.DRAFT;
      state.currentTypeName = null;
      state.selectedDataModelVersion = action.payload;
      state.editorMode =
        action.payload.status === DataModelVersionStatus.DRAFT
          ? SchemaEditorMode.Edit
          : SchemaEditorMode.View;
    },
    dataModelPublished: (state) => {
      state.isDirty = false;
      state.currentTypeName = null;
      state.editorMode = SchemaEditorMode.View;
    },
    clearState,
  },
});

export type DataModelState = ReturnType<typeof dataModelSlice.reducer>;
export const { actions } = dataModelSlice;
export default dataModelSlice;
