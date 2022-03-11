import { CogniteClient } from '@cognite/sdk';

import { log } from './log';

let globalClient: CogniteClient;

export const setClient = (client: CogniteClient) => {
  globalClient = client;
};

export const getCogniteSDKClient = () => {
  return globalClient;
};

let globalEmail: string;
export const setEmail = (email?: string) => {
  if (email) {
    globalEmail = email;
  }
};
export const getEmail = () => {
  return globalEmail;
};

let lastReAuthTime = 0;
let globalReauth: () => void;

export const setReAuth = (reauth?: () => void) => {
  if (reauth) {
    globalReauth = reauth;
  }
};

export const doReAuth = () => {
  const now = +new Date();
  // debounce this to stop some bad loops/spamming!
  //
  // this is because we often do multiple requests at the same time
  // and we only want the first one to trigger the reauth request
  //
  const debounce = 5000 as const; // 5 seconds
  const reauthNeverDone = lastReAuthTime === 0;
  const reauthDoneAgesAgo = now - lastReAuthTime > debounce;
  if (!reauthNeverDone && !reauthDoneAgesAgo) {
    log('Trying to re-auth too soon', [now - lastReAuthTime]);
    return false;
  }

  lastReAuthTime = now;

  return globalReauth ? globalReauth() : log('No re-auth method found!');
};
