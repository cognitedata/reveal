import { useAuthContext } from '../components';

import { getAuthorizationHeader } from './headers';
import type { AuthHeaders } from './types';

interface Options {
  useIdToken?: boolean;
}
export const getAuthHeaders = ({ useIdToken }: Options = {}): AuthHeaders => {
  const { authState } = useAuthContext();

  if (useIdToken && authState?.idToken) {
    return getAuthorizationHeader(authState?.idToken);
  }

  if (authState?.token) {
    return getAuthorizationHeader(authState?.token);
  }

  return getAuthorizationHeader('unknown');
};
