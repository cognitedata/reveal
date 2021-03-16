// import { retrieveAuthResult } from '@cognite/auth-utils';
import * as React from 'react';
import { AuthProvider } from '../components/AuthContainer';
import { log } from '../utils/log';
import { AuthHeaders } from './types';

interface Options {
  apiKeyHeader?: string;
  useIdToken?: boolean;
}
export const getAuthHeaders = ({
  apiKeyHeader,
  useIdToken,
}: Options = {}): AuthHeaders => {
  const { authState } = React.useContext(AuthProvider);

  if (useIdToken && authState?.idToken) {
    return { Authorization: `Bearer ${authState?.idToken}` };
  }
  if (authState?.token) {
    return { Authorization: `Bearer ${authState?.token}` };
  }

  const apiKey = process.env.REACT_APP_API_KEY || '';

  if (!apiKey) {
    log('Missing auth method. No token or key found.');
  }

  return { [apiKeyHeader || 'api-key']: apiKey };
};
