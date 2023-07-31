import { decodeTokenUid } from '@cognite/auth-utils';

export const getUserIdFromToken = (idToken?: string): string => {
  if (idToken) {
    const userId = decodeTokenUid(idToken);
    return userId || '';
  }

  return '';
};
