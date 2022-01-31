import { ConfidentialClientApplication } from '@azure/msal-node';
import { readFromCache, cachePlugin } from '../../utils/msalTokenCache';
import { Logger } from '@platypus/platypus-core';
import { handleResponse } from './common';

export type CSAccessTokenRequest = {
  clientId: string;
  clientSecret: string;
  authority: string;
  scopes: string[];
  account?: string;
  logger: Logger;
};

export const getAccessTokenForClientSecret = async (
  request: CSAccessTokenRequest
) => {
  const { clientId, clientSecret, authority, scopes } = request;

  const cca = new ConfidentialClientApplication({
    auth: { clientId, clientSecret },
    cache: { cachePlugin },
  });

  // MUST DO: Need to load credentials from local cache store first.
  readFromCache(cca.getTokenCache());
  return cca
    .acquireTokenByClientCredential({ scopes, authority })
    .then(handleResponse);
};
