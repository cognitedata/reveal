/* eslint-disable no-param-reassign */
import { DEFAULT_VERSION_PATH } from '@platypus-app/utils/config';
import {
  BuiltInType,
  DataModelTypeDefs,
  DataModelTypeDefsType,
  UpdateDataModelFieldDTO,
} from '@platypus/platypus-core';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { rootInjector, TOKENS } from '@platypus-app/di';

export interface DataModelReducerState {
  currentTypeName: null | string;
  graphQlSchema: string;
  isDirty: boolean;
  selectedVersionNumber: string;
  typeDefs: DataModelTypeDefs;
  typeFieldErrors: { [key: string]: string };
  hasError: boolean;
  customTypesNames: string[];
  builtInTypes: BuiltInType[];
}

export const initialState = {
  currentTypeName: null as null | string,
  graphQlSchema: '',
  isDirty: false,
  selectedVersionNumber: DEFAULT_VERSION_PATH,
  typeDefs: { types: [] } as DataModelTypeDefs,
  typeFieldErrors: {} as { [key: string]: string },
  hasError: false,
  customTypesNames: [] as string[],
  builtInTypes: [],
} as DataModelReducerState;

const getTypeDefsBuilder = () =>
  rootInjector.get(TOKENS.dataModelTypeDefsBuilderService);

const updateDataModelState = (
  state: DataModelReducerState
): DataModelReducerState => {
  const typeDefsBuilder = getTypeDefsBuilder();
  const updatedGqlSchema = typeDefsBuilder.buildSchemaString();
  state.graphQlSchema = updatedGqlSchema;
  state.customTypesNames = typeDefsBuilder.getCustomTypesNames(state.typeDefs);

  const validationErrors = typeDefsBuilder.validate(
    updatedGqlSchema,
    state.builtInTypes
  );

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
  state.typeFieldErrors = {};
  state.customTypesNames = [];
  state.builtInTypes = typeDefsBuilder.getBuiltinTypes();
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
    setSelectedVersionNumber: (state, action: PayloadAction<string>) => {
      state.selectedVersionNumber = action.payload;
    },
    setTypeFieldErrors: (
      state,
      action: PayloadAction<{ fieldName: string; error: string }>
    ) => {
      if (action.payload.error === '') {
        delete state.typeFieldErrors[action.payload.fieldName];
      } else {
        state.typeFieldErrors[action.payload.fieldName] = action.payload.error;
      }
    },
    parseGraphQlSchema: (state, action: PayloadAction<string>) => {
      const graphQlSchemaString = action.payload;
      const typeDefsBuilder = getTypeDefsBuilder();
      const validationErrors = typeDefsBuilder.validate(
        graphQlSchemaString,
        state.builtInTypes
      );

      const hasError = validationErrors.length > 0;
      state.hasError = hasError;

      if (graphQlSchemaString !== '') {
        if (!hasError) {
          try {
            const parsedTypeDefs =
              typeDefsBuilder.parseSchema(graphQlSchemaString);
            state.typeDefs = parsedTypeDefs;
            state.customTypesNames =
              typeDefsBuilder.getCustomTypesNames(parsedTypeDefs);
          } catch (err) {
            clearState(state);
          }
        }
      } else {
        clearState(state);
      }
    },
    setBuiltInTypes: (state, action: PayloadAction<BuiltInType[]>) => {
      state.builtInTypes = action.payload;
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
    clearState,
  },
});

export type DataModelState = ReturnType<typeof dataModelSlice.reducer>;
export const { actions } = dataModelSlice;
export default dataModelSlice;
