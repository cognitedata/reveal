import { useAuthContext } from '../components/AuthContainer';

import type { AuthHeaders } from './types';
import { getAuthorizationHeader } from './headers';

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
