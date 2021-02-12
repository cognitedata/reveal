// import { retrieveAuthResult } from '@cognite/auth-utils';

import { log } from '../utils/log';
import { AuthHeaders } from './types';

export const getAuthHeaders = (apiKeyHeader = 'api-key'): AuthHeaders => {
  // -TODO: get from SDK once that is ready. for now, this is not possible (easily)
  const authResult = { accessToken: '' };

  if (authResult?.accessToken) {
    return { Authorization: `Bearer ${authResult.accessToken}` };
  }

  const apiKey = process.env.REACT_APP_API_KEY || '';

  if (!apiKey) {
    log('Missing auth method. No token or key found.');
  }

  return { [apiKeyHeader || 'api-key']: apiKey };
};
