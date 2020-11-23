import { AuthHeaders } from './types';
import { retrieveAccessToken } from '../utils/persistance';

export const getAuthHeaders = (apiKeyHeader = 'api-key'): AuthHeaders => {
  const token = retrieveAccessToken();

  if (token) {
    return { Authorization: `Bearer ${token}` };
  }

  return { [apiKeyHeader || 'api-key']: process.env.REACT_APP_API_KEY || '' };
};
