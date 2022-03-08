import {
  AccountInfo,
  AuthenticationResult,
  CryptoProvider,
  PublicClientApplication,
} from '@azure/msal-node';
import { readFromCache, cachePlugin } from '../../utils/msalTokenCache';
import open from 'open';
import { Logger } from '@platypus/platypus-core';
import {
  listenForAuthCode,
  openServerAtPort,
} from '../../utils/msalCallbackServer';
import { AddressInfo } from 'net';
import { handleResponse } from './common';

export type PKAccessTokenRequest = {
  clientId: string;
  authority: string;
  baseUrl: string;
  account?: string;
  logger: Logger;
};

const cryptoProvider = new CryptoProvider();

export const getAccessTokenForPKCE = async (request: PKAccessTokenRequest) => {
  const { clientId, authority, baseUrl, account: accountString } = request;
  const scopes = [
    `${baseUrl}/IDENTITY`,
    `${baseUrl}/user_impersonation`,
    'offline_access',
  ];
  const pca = new PublicClientApplication({
    auth: {
      clientId,
      authority,
    },
    cache: { cachePlugin },
  });

  const account = accountString
    ? (JSON.parse(accountString) as AccountInfo)
    : undefined;

  // MUST DO: Need to load credentials from local cache store first.
  readFromCache(pca.getTokenCache());

  let authResult: AuthenticationResult | null = null;

  if (account) {
    // try to refresh the token silently otherwise
    try {
      authResult = await pca.acquireTokenSilent({
        account: account,
        scopes: scopes,
      });
      return handleResponse(authResult);
    } catch {
      throw new Error('Failed to authenticate, please sign in again!');
    }
  }
  const { verifier, challenge } = await cryptoProvider.generatePkceCodes();
  const { app, server } = await openServerAtPort();

  const redirectURI = `http://localhost:${
    (server.address() as AddressInfo).port
  }/redirect`;
  // create redirect URL
  const authCodeUrl = await pca.getAuthCodeUrl({
    redirectUri: redirectURI,
    scopes,
    codeChallenge: challenge, // PKCE Code Challenge
    codeChallengeMethod: 'S256',
  });
  request.logger.info(
    `Opening browser for authentication (if your browser is not opened please copy + paste this link):`
  );
  request.logger.log(authCodeUrl);
  await open(authCodeUrl);

  try {
    // get `code` for user and complete authentication
    const authCode = await listenForAuthCode(app);
    authResult = await pca.acquireTokenByCode({
      redirectUri: redirectURI,
      scopes,
      code: authCode,
      codeVerifier: verifier, // PKCE Code Verifier
    });

    if (authResult) {
      return handleResponse(authResult);
    }
    throw new Error('Failed to authenticate');
  } finally {
    // close the server we opened
    server.close();
  }
};
