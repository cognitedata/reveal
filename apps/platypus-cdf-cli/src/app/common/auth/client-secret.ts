import { ConfidentialClientApplication } from '@azure/msal-node';
import { readFromCache, cachePlugin } from '../../utils/msalTokenCache';
import { Logger } from '@platypus/platypus-core';
import { handleResponse } from './common';
import { DEBUG as _DEBUG } from '../../utils/logger';

const DEBUG = _DEBUG.extend('auth:client-secret');

export type CSAccessTokenRequest = {
  clientId: string;
  clientSecret: string;
  authority: string;
  baseUrl: string;
  account?: string;
  logger: Logger;
};

export const getAccessTokenForClientSecret = async (
  request: CSAccessTokenRequest
) => {
  const { clientId, clientSecret, authority, baseUrl } = request;
  const scopes = [`${baseUrl}/.default`, 'offline_access'];

  const cca = new ConfidentialClientApplication({
    auth: { clientId, clientSecret },
    cache: { cachePlugin },
  });

  // MUST DO: Need to load credentials from local cache store first.
  readFromCache(cca.getTokenCache());

  DEBUG('Starting to aquire client credential token');
  return cca
    .acquireTokenByClientCredential({ scopes, authority })
    .then(handleResponse);
};
