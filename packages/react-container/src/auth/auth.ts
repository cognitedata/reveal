// import { retrieveAuthResult } from '@cognite/auth-utils';
import * as React from 'react';

import { AuthProvider } from '../components/AuthContainer';
import { log } from '../utils/log';

import type { AuthHeaders } from './types';

const getAuthorizationHeader = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

interface Options {
  apiKeyHeader?: string;
  useIdToken?: boolean;
}
export const getAuthHeaders = ({
  apiKeyHeader,
  useIdToken,
}: Options = {}): AuthHeaders => {
  const { authState } = React.useContext(AuthProvider);

  // this check is extra saftey so we always double confirm this e2e auth bypass mode
  if (process.env.REACT_APP_E2E_MODE) {
    // check local id token (E2E) before state token
    const idToken = process.env.REACT_APP_ID_TOKEN || '';
    if (useIdToken && idToken) {
      return getAuthorizationHeader(idToken);
    }
    // check local access token (E2E) before state token
    const accessToken = process.env.REACT_APP_ACCESS_TOKEN || '';
    if (accessToken) {
      return getAuthorizationHeader(accessToken);
    }
    const apiKey = process.env.REACT_APP_API_KEY || '';
    if (!apiKey) {
      log('Missing auth method. No token or key found.');
    }
    return { [apiKeyHeader || 'api-key']: apiKey };
  }

  if (useIdToken && authState?.idToken) {
    return getAuthorizationHeader(authState?.idToken);
  }

  if (authState?.token) {
    return getAuthorizationHeader(authState?.token);
  }

  return getAuthorizationHeader('unknown');
};
