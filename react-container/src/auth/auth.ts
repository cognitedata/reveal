// import { retrieveAuthResult } from '@cognite/auth-utils';
import * as React from 'react';
import { AuthProvider } from '../components/AuthContainer';
import { log } from '../utils/log';
import { AuthHeaders } from './types';

export const getAuthHeaders = (apiKeyHeader = 'api-key'): AuthHeaders => {
  const { authState } = React.useContext(AuthProvider);

  if (authState?.token) {
    return { Authorization: `Bearer ${authState?.token}` };
  }

  const apiKey = process.env.REACT_APP_API_KEY || '';

  if (!apiKey) {
    log('Missing auth method. No token or key found.');
  }

  return { [apiKeyHeader || 'api-key']: apiKey };
};
