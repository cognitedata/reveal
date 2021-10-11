export const SET_CONSENT = 'USERS_SET_CONSENT';
export const COOKIE_CONSENT = 'COOKIE_CONSENT';

export interface BasicUserInfo {
  id: string;
  email?: string;
  firstname?: string;
  lastname?: string;
}

/**
 * This is the type that discover-api returns for user. The user data is no longer stored in the state but in react-query
 * */
export interface User extends BasicUserInfo {
  lastUpdatedTime: string;
  createdTime: string;
}

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

export interface AuthModes {
  isAdmin: boolean;
  isUser: boolean;
}
