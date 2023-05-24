import { CogniteAuthentication, REDIRECT } from '@cognite/sdk';

import { LEGACY_SESSION_TOKEN_KEY } from './constants';
import { getBaseUrl, getCluster, getEnv, getProject } from './utils';

const cluster = getCluster();
const env = getEnv();
const project = getProject();

const getSessionStorageKey = () =>
  `${LEGACY_SESSION_TOKEN_KEY}_${cluster ?? env}_${project}`;

const getRedirectLegacyToken = async () => {
  const baseUrl = await getBaseUrl();
  const legacyInstance = new CogniteAuthentication({
    project,
    baseUrl,
  });
  let token = await legacyInstance.handleLoginRedirect();
  if (token) {
    sessionStorage.setItem(getSessionStorageKey(), token.accessToken);
    return token.accessToken;
  }
  token = await legacyInstance.login({ onAuthenticate: REDIRECT });
  if (token) {
    return token.accessToken;
  }
  throw new Error('could not get access token');
};

export default async function getLegacyToken() {
  const baseUrl = await getBaseUrl();
  const sessionKey = getSessionStorageKey();
  const sessionToken = sessionStorage.getItem(sessionKey);
  if (sessionToken) {
    try {
      const url = `${baseUrl}/login/status`;
      const status: { loggedIn: boolean } = (
        await fetch(url, {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        }).then((r) => r.json())
      )?.data;

      if (status.loggedIn) {
        return sessionToken;
      }
      throw new Error('expired token');
    } catch (e) {
      sessionStorage.removeItem(sessionKey);
      return getRedirectLegacyToken();
    }
  }
  return getRedirectLegacyToken();
}

export function logout() {
  const sessionKey = getSessionStorageKey();
  sessionStorage.removeItem(sessionKey);
}
