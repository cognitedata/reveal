import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ValueOf } from 'typings/utils';
import { User } from './types';

export const initialState = {
  tenant: undefined as string | undefined,
  user: undefined as User | undefined,
  firebaseReady: false,
  ui: {},
};

const environment = createSlice({
  name: 'environment',
  initialState,
  reducers: {
    onInitialLoad: (state, action: PayloadAction<{ tenant: string }>) => {
      state.tenant = action.payload.tenant;
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    onFirebaseReady: (state) => {
      state.firebaseReady = true;
    },
  },
});

export type EnvironmentAction = ReturnType<ValueOf<typeof environment.actions>>;
export type EnvironmentState = ReturnType<typeof environment.reducer>;

export default environment;
