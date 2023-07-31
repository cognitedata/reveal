import { getAuthHeaders } from '@cognite/react-container';

export const getHeaders = (fasAppId?: string, idToken?: string) => {
  if (idToken) {
    return { Authorization: `Bearer ${idToken}`, fasAppId };
  }

  return { ...getAuthHeaders({ useIdToken: true }), fasAppId };
};
