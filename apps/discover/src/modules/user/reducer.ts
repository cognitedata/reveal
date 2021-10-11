import { UserState, UserAction, SET_CONSENT } from './types';

export const initialState = {
  hasGivenConsent: undefined,
};

export function user(state: UserState = initialState, action: UserAction) {
  switch (action.type) {
    case SET_CONSENT: {
      return {
        ...state,
        hasGivenConsent: action.hasGivenConsent,
      };
    }

    default:
      return state;
  }
}
