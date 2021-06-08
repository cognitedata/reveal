import { Metrics } from '@cognite/metrics';
import jwtDecode from 'jwt-decode';

import { AuthResult, DecodedIdToken, isOAuthAuthResult } from 'auth/types';
import { storage } from './localStorage';

const AUTH_RESULT_STORAGE_KEY = 'authResult';
// if token is valid for less than 5 more minutes we might just discard it
const TOKEN_TTL_BUFFER_SECCONDS = 60 * 5;

export const persistAuthResult = (authResult: AuthResult | undefined) => {
  storage.setItem(AUTH_RESULT_STORAGE_KEY, authResult);
};

function getTokenTtlSeconds(decodedIdToken: DecodedIdToken): number {
  const currentTimestampSeconds = Math.floor(Date.now() / 1000);
  return decodedIdToken.exp - currentTimestampSeconds;
}

export const retrieveAuthResult = (): AuthResult | undefined => {
  const metrics = Metrics.create('AuthPersistance');
  const authResult = storage.getItem<AuthResult>(AUTH_RESULT_STORAGE_KEY);

  if (!authResult) {
    return undefined;
  }

  if (isOAuthAuthResult(authResult)) {
    const { idToken } = authResult;
    const decodedIdToken = jwtDecode(idToken) as DecodedIdToken;
    const tokenTtlSeconds = getTokenTtlSeconds(decodedIdToken);

    metrics.track('retrieveAuthResult', {
      ttlSeconds: tokenTtlSeconds,
      user: decodedIdToken.sub,
      project: decodedIdToken.project_name,
    });

    if (tokenTtlSeconds < TOKEN_TTL_BUFFER_SECCONDS) {
      removeAuthResultFromStorage();
      return undefined;
    }
  }

  return authResult;
};

export const removeAuthResultFromStorage = () => {
  storage.removeItem(AUTH_RESULT_STORAGE_KEY);
};

export const retrieveAccessToken = (): string | undefined => {
  const authResult = retrieveAuthResult();
  return authResult ? authResult.accessToken : undefined;
};
