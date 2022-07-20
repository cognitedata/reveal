/* eslint-disable no-param-reassign */
import { DEFAULT_VERSION_PATH } from '@platypus-app/utils/config';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState = {
  currentTypeName: null as null | string,
  graphQlSchema: '',
  isDirty: false,
  selectedVersionNumber: DEFAULT_VERSION_PATH,
  typeFieldErrors: {} as { [key: string]: string },
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
  },
});

export type DataModelState = ReturnType<typeof dataModelSlice.reducer>;
export const { actions } = dataModelSlice;
export default dataModelSlice;
