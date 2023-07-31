export const SET_CONSENT = 'USERS_SET_CONSENT';
export const INITIALIZE_CONSENT = 'INITIALIZE_CONSENT';
export const COOKIE_CONSENT = 'COOKIE_CONSENT';

export interface UserState {
  hasGivenConsent: boolean | undefined;
}

export interface SetConsent {
  type: typeof SET_CONSENT;
  hasGivenConsent: boolean;
}

export interface InitializeConsent {
  type: typeof SET_CONSENT;
  hasGivenConsent: boolean;
}

export type UserAction = SetConsent;
