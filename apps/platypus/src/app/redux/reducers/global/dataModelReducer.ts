import { fetchVersions, fetchDataModel } from './actions';
/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DataModelVersion, DataModel } from '@platypus/platypus-core';
import { ActionStatus } from '@platypus-app/types';
import { DEFAULT_VERSION_PATH } from '@platypus-app/utils/config';

const initialState = {
  dataModel: undefined as DataModel | undefined,
  dataModelStatus: ActionStatus.IDLE,
  dataModelError: '',
  selectedSchema: {
    schema: '',
    externalId: '',
    status: 'DRAFT',
    version: '1',
    createdTime: Date.now(),
    lastUpdatedTime: Date.now(),
  } as DataModelVersion,
  schemas: [] as DataModelVersion[],
  schemasStatus: ActionStatus.IDLE,
  schemasError: '',
};

const dataModelSlice = createSlice({
  name: 'data-model',
  initialState: initialState,
  reducers: {
    selectVersion: (state, action: PayloadAction<{ version: string }>) => {
      if (state.schemas.length) {
        if (action.payload.version === DEFAULT_VERSION_PATH) {
          state.selectedSchema = state.schemas[0];
        } else {
          state.selectedSchema = state.schemas.find(
            (schema) => schema.version === action.payload.version
          ) as DataModelVersion;
        }
      } else {
        state.selectedSchema = {
          ...initialState.selectedSchema,
          externalId: state.dataModel!.id,
        };
      }
    },
    setSchema: (state, action: PayloadAction<DataModelVersion>) => {
      state.selectedSchema = action.payload;
    },
    insertSchema: (state, action: PayloadAction<DataModelVersion>) => {
      state.schemas = [action.payload, ...state.schemas];
    },
  },
  extraReducers: (builder) => {
    // Fetching data model
    builder.addCase(fetchDataModel.pending, (state) => {
      state.dataModelStatus = ActionStatus.PROCESSING;
    });
    builder.addCase(fetchDataModel.fulfilled, (state, action) => {
      state.dataModelStatus = ActionStatus.SUCCESS;
      state.dataModel = action.payload;
    });
    builder.addCase(fetchDataModel.rejected, (state, action) => {
      state.dataModelStatus = ActionStatus.FAIL;
      state.dataModelError = action.error.message as string;
    });

    // Fetching versions
    builder.addCase(fetchVersions.pending, (state) => {
      state.schemasStatus = ActionStatus.PROCESSING;
    });
    builder.addCase(fetchVersions.fulfilled, (state, action) => {
      state.schemasStatus = ActionStatus.SUCCESS;
      state.schemas = action.payload;
      state.selectedSchema = action.payload.length
        ? action.payload[0]
        : initialState.selectedSchema;
    });
    builder.addCase(fetchVersions.rejected, (state, action) => {
      state.schemasStatus = ActionStatus.FAIL;
      state.schemasError = action.error.message as string;
    });
  },
});

export type DataModelState = ReturnType<typeof dataModelSlice.reducer>;
export const { actions } = dataModelSlice;
export default dataModelSlice;
