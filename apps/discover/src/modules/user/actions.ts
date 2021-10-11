import { storage } from '@cognite/react-container';

import {
  SET_CONSENT,
  COOKIE_CONSENT,
  SetConsent,
  InitializeConsent,
} from './types';

export function setConsent(): SetConsent {
  storage.setItem(COOKIE_CONSENT, true);
  return { type: SET_CONSENT, hasGivenConsent: true };
}

export function initializeConsent(): InitializeConsent {
  return {
    type: SET_CONSENT,
    hasGivenConsent: storage.getItem<boolean>(COOKIE_CONSENT, false) as boolean,
  };
}

export const userActions = {
  initializeConsent,
  setConsent,
};

export default userActions;
