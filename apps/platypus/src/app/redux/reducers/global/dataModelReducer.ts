import { DEFAULT_VERSION_PATH } from '@platypus-app/utils/config';
import { DataModel, DataModelVersion } from '@platypus/platypus-core';
/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState = {
  dataModel: undefined as DataModel | undefined,
  selectedVersion: {
    schema: '',
    externalId: '',
    status: 'DRAFT',
    version: '1',
    createdTime: Date.now(),
    lastUpdatedTime: Date.now(),
  } as DataModelVersion,
  typeFieldErrors: {} as { [key: string]: string },
  versions: [] as DataModelVersion[],
};

const dataModelSlice = createSlice({
  name: 'data-model',
  initialState: initialState,
  reducers: {
    setDataModel: (state, action: PayloadAction<{ dataModel: DataModel }>) => {
      state.dataModel = action.payload.dataModel;
    },
    setDataModelVersions: (
      state,
      action: PayloadAction<{ dataModelVersions: DataModelVersion[] }>
    ) => {
      state.versions = action.payload.dataModelVersions;
    },
    selectVersion: (state, action: PayloadAction<{ version: string }>) => {
      if (state.versions.length) {
        if (action.payload.version === DEFAULT_VERSION_PATH) {
          state.selectedVersion = state.versions.sort((a, b) =>
            +a.version < +b.version ? 1 : -1
          )[0];
        } else {
          state.selectedVersion = state.versions.find(
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
      state.versions = [action.payload, ...state.versions];
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
