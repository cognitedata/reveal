import { CogniteClient } from '@cognite/sdk';
import { CogniteClient as CogniteClientV7 } from '@cognite/sdk-v7';

import { log } from './log';

let globalClient: CogniteClient;
let globalClientV7: CogniteClientV7;
export const setClient = (client: CogniteClient) => {
  globalClient = client;
};

export const getCogniteSDKClient = () => {
  return globalClient;
};

export const setClientV7 = (client: CogniteClientV7) => {
  globalClientV7 = client;
};

export const getCogniteSDKClientV7 = (): CogniteClientV7 => {
  return globalClientV7;
};

export const createCogniteSDKClientV7 = ({
  appId,
  baseUrl,
}: {
  appId: string;
  baseUrl: string;
}) => {
  return new CogniteClientV7({ appId, baseUrl });
};

export const authenticateCogniteSDKV7 = ({
  appId,
  baseUrl,
  project,
  token,
}: {
  appId: string;
  baseUrl: string;
  project: string;
  token: string;
}) => {
  const sdkV7 = createCogniteSDKClientV7({ appId, baseUrl });
  setClientV7(sdkV7);
  sdkV7.loginWithOAuth({
    type: 'CDF_OAUTH',
    options: {
      project,
      onAuthenticate: (login) => {
        login.skip();
      },
      accessToken: token,
    },
  });
  return sdkV7;
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
