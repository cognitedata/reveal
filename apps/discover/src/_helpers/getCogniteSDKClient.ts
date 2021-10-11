import { CogniteClient } from '@cognite/sdk';

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

let lastReAuthTime: number = +new Date();
let globalReauth: () => void;
export const setReAuth = (reauth?: () => void) => {
  if (reauth) {
    globalReauth = reauth;
  }
};
export const doReAuth = () => {
  const now = +new Date();
  // debounce this to stop some bad loops/spamming
  const debounce = 10 * 1000; // 10 seconds
  if (now - lastReAuthTime > debounce) {
    return false;
  }

  lastReAuthTime = now;

  return globalReauth ? globalReauth() : false;
};
