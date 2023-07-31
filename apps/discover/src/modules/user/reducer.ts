import { createReducer } from '@reduxjs/toolkit';

import { storage } from '@cognite/react-container';

import { initializeConsent, setConsent } from './actions';
import { UserState, UserAction, COOKIE_CONSENT } from './types';

export const initialState = {
  hasGivenConsent: undefined,
} as UserState;

const userReducerCreator = createReducer(initialState, (builder) => {
  builder
    .addCase(setConsent, (state) => {
      storage.setItem(COOKIE_CONSENT, true);
      state.hasGivenConsent = true;
    })
    .addCase(initializeConsent, (state) => {
      state.hasGivenConsent = storage.getItem<boolean>(
        COOKIE_CONSENT,
        false
      ) as boolean;
    });
});

export const user = (
  state: UserState | undefined,
  action: UserAction
): UserState => {
  return userReducerCreator(state, action);
};

export default user;
