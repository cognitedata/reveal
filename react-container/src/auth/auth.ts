import { log } from 'utils/log';

import { AuthHeaders } from './types';
import { retrieveAccessToken } from '../utils/persistance';

export const getAuthHeaders = (apiKeyHeader = 'api-key'): AuthHeaders => {
  const token = retrieveAccessToken();

  if (token) {
    return { Authorization: `Bearer ${token}` };
  }

  const apiKey = process.env.REACT_APP_API_KEY || '';

  if (!apiKey) {
    log('Missing auth method. No token or key found.');
  }

  return { [apiKeyHeader || 'api-key']: apiKey };
};
