/* eslint-disable no-param-reassign */
import { AuthenticatedUser } from '@platypus-app/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
