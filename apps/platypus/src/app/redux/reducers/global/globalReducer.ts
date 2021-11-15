/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthenticatedUser } from '@platypus-app/types';

const globalStateSlice = createSlice({
  name: 'global',
  initialState: {
    authenticatedUser: {
      user: '',
      project: '',
      projectId: '',
    } as AuthenticatedUser,
  },
  reducers: {
    setAuthenticatedUser: (state, action: PayloadAction<AuthenticatedUser>) => {
      state.authenticatedUser = Object.assign(
        state.authenticatedUser,
        action.payload
      );
    },
  },
});

export type AuthState = ReturnType<typeof globalStateSlice.reducer>;
export const { actions } = globalStateSlice;
export default globalStateSlice;
