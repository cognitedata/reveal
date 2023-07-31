import { createAction } from '@reduxjs/toolkit';

import { SET_CONSENT, INITIALIZE_CONSENT } from './types';

export const setConsent = createAction(SET_CONSENT);
export const initializeConsent = createAction(INITIALIZE_CONSENT);
