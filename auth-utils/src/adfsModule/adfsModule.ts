/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable camelcase */
/* eslint-disable no-console */
import axios from 'axios';
import jwt_decode from 'jwt-decode';

import { isAuthFlow, retrieveAuthResult, saveAuthResult } from '../storage';
import { AuthResult } from '../storage';
import config from '../config';

const { cluster, oidc } = config;

const authConfig = {
  authority: oidc.authority,
  client_id: oidc.clientId,
  redirect_uri: `${window.location.origin}`,
  scope: oidc.scope,
  response_mode: 'fragment',
  response_type: 'id_token token',
  extraQueryParams: {
    resource: `https://${cluster}.cognitedata.com`,
  },
};

type TokenResult = {
  access_token: string;
  id_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
};
const defaultTokenResult: TokenResult = {
  access_token: '',
  id_token: '',
  expires_in: 0,
  scope: '/.default',
  token_type: 'bearer',
};

const defaultState: AuthResult | undefined = undefined;

let state: AuthResult | undefined = defaultState;

// const decodeTokenADFS = (idToken: string) => {
//   if (idToken) {
//     return jwt_decode<{ upn: string }>(idToken);
//   }
//   return undefined;
// };

export function processSigninResponse(): AuthResult | undefined {
  try {
    const url = window.location.href;
    const index = url.indexOf('#');

    if (index > -1 && url.length > index + 1) {
      const params = url
        .substring(index + 1, url.length)
        .split('&')
        .reduce<TokenResult>((acc, keyVal) => {
          const [key, val] = keyVal.split('=');
          return { ...acc, [key]: val };
        }, defaultTokenResult);

      const replaced = url.substring(0, index + 1);
      window.location.href = replaced;
      console.log(params);
      saveAuthResult({
        accessToken: params.access_token,
        idToken: params.id_token,
        expTime: new Date().getTime() + params.expires_in,
        authFlow: 'ADFS',
      });
      return retrieveAuthResult();
    }
    console.log('Not parsing', url.length, index);
    return retrieveAuthResult();
  } catch (e) {
    console.error('processSigninResponse', e);
    return undefined;
  }
}

export const initAuth = () => {
  const authCache = retrieveAuthResult();
  if (authCache && isAuthFlow('ADFS')) {
    const authResult = processSigninResponse();
    if (
      authResult &&
      authResult.accessToken &&
      authResult.accessToken.length !== 0
    ) {
      state = authResult;
    }
  }
};

export const isSignedIn = () => {
  return state && state.idToken && state.idToken.length > 0;
};

export const signInWithADFSRedirect = async () => {
  try {
    const url = `${authConfig.authority}?client_id=${
      authConfig.client_id
    }&redirect_uri=${authConfig.redirect_uri}&scope=${
      authConfig.scope
    }&response_mode=${authConfig.response_mode}&response_type=${
      authConfig.response_type
    }&${Object.entries(authConfig.extraQueryParams).reduce(
      (acc, [key, val]) => `${acc}${key}=${val}`,
      ''
    )}`;

    window.location.href = url;
  } catch (e) {
    console.error('signIn', e);
  }
};

export const listClusterProjects = async (
  token: string,
  selectedCluster: string
): Promise<{ urlName: string; cluster: string }[]> => {
  try {
    const res = await axios.get(
      `https://${selectedCluster}.cognitedata.com/api/v1/projects`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res.data.items.map((item: any) => ({
      ...item,
      cluster: selectedCluster,
    }));
  } catch (e) {
    return [];
  }
};

export const listProjects = async () => {
  if (state && state.accessToken && cluster) {
    const projects = await listClusterProjects(state.accessToken, cluster);
    return projects;
  }
};

export const clearState = () => {
  state = defaultState;
};

export const getAccessToken = () => {
  return state && state.accessToken;
};
export const getIdToken = () => {
  return state && state.idToken;
};

export const getUserInfo = (idToken?: string) => {
  if (idToken) {
    return jwt_decode(idToken);
  }
  return undefined;
};

export const userInfoMapper = (userInfo: any) => {
  return {
    username: userInfo.upn,
    projectId: 'not used',
  };
};
