import { DEFAULT_VERSION_PATH } from '@platypus-app/utils/config';
import { DataModel, DataModelVersion } from '@platypus/platypus-core';
/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState = {
  currentTypeName: null as null | string,
  dataModel: undefined as DataModel | undefined,
  dataModelVersions: [] as DataModelVersion[],
  graphQlSchema: '',
  isDirty: false,
  selectedVersion: {
    schema: '',
    externalId: '',
    status: 'DRAFT',
    version: '1',
    createdTime: Date.now(),
    lastUpdatedTime: Date.now(),
  } as DataModelVersion,
  typeFieldErrors: {} as { [key: string]: string },
};

const dataModelSlice = createSlice({
  name: 'data-model',
  initialState: initialState,
  reducers: {
    setCurrentTypeName: (state, action: PayloadAction<string | null>) => {
      state.currentTypeName = action.payload;
    },
    setDataModel: (state, action: PayloadAction<{ dataModel: DataModel }>) => {
      state.dataModel = action.payload.dataModel;
    },
    setDataModelVersions: (
      state,
      action: PayloadAction<{ dataModelVersions: DataModelVersion[] }>
    ) => {
      state.dataModelVersions = action.payload.dataModelVersions;
    },
    setGraphQlSchema: (state, action: PayloadAction<string>) => {
      state.graphQlSchema = action.payload;
    },
    setIsDirty: (state, action: PayloadAction<boolean>) => {
      state.isDirty = action.payload;
    },
    selectVersion: (state, action: PayloadAction<{ version: string }>) => {
      if (state.dataModelVersions.length) {
        if (action.payload.version === DEFAULT_VERSION_PATH) {
          state.selectedVersion = state.dataModelVersions.sort((a, b) =>
            +a.version < +b.version ? 1 : -1
          )[0];
        } else {
          state.selectedVersion = state.dataModelVersions.find(
            (schema) => schema.version === action.payload.version
          ) as DataModelVersion;
        }
      } else {
        state.selectedVersion = {
          ...initialState.selectedVersion,
          externalId: state.dataModel!.id,
        };
      }
    },
    setVersion: (state, action: PayloadAction<DataModelVersion>) => {
      state.selectedVersion = action.payload;
    },
    insertVersion: (state, action: PayloadAction<DataModelVersion>) => {
      state.dataModelVersions = [action.payload, ...state.dataModelVersions];
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
  },
});

export type DataModelState = ReturnType<typeof dataModelSlice.reducer>;
export const { actions } = dataModelSlice;
export default dataModelSlice;
