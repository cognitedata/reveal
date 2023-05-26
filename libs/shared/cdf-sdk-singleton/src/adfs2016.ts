// eslint-disable-next-line @cognite/no-sdk-submodule-imports
import { removeSelectedIdpDetails } from '@cognite/login-utils';
import { ADFS } from '@cognite/sdk-core';

import { ADFS_SESSION_TOKEN_KEY } from './constants';
import { getBaseUrl, getCluster, getEnv, getProject } from './utils';

const cluster = getCluster();
const env = getEnv();
const project = getProject();

const getSessionStorageKey = () =>
  `${ADFS_SESSION_TOKEN_KEY}_${cluster ?? env}_${project}`;

export async function getAccessToken(authority: string, clientId: string) {
  const sessionKey = getSessionStorageKey();
  const sessionToken = sessionStorage.getItem(sessionKey);
  const baseUrl = await getBaseUrl();
  if (sessionToken) {
    try {
      const url = `${baseUrl}/api/v1/token/inspect`;
      const status: { subject: string } = await fetch(url, {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      }).then((r) => {
        if (r.status === 200) {
          return r.json();
        }
        return Promise.reject(new Error('invalid token'));
      });

      if (status.subject) {
        return sessionToken;
      }
      throw new Error('expired token');
    } catch (e) {
      sessionStorage.removeItem(sessionKey);
    }
  }
  return getADFSAccessToken(authority, clientId);
}

async function getADFSAccessToken(authority: string, clientId: string) {
  const baseUrl = await getBaseUrl();
  const adfs = new ADFS({
    authority,
    requestParams: {
      clientId,
      resource: baseUrl || '',
    },
  });
  const token = await adfs.getCDFToken();

  if (!token) {
    const loginToken = await adfs.login();
    if (loginToken) {
      return loginToken;
    }
    return Promise.reject(new Error('token not found'));
  }
  sessionStorage.setItem(getSessionStorageKey(), token);

  return token;
}
export async function logout(authority: string) {
  removeSelectedIdpDetails();
  sessionStorage.clear();
  window.location.href = `${authority}/logout`;
}
