import { getJsonHeaders } from 'modules/api/service';

export const useAccessToken = () => {
  const authHeaders = getJsonHeaders();

  let authToken = '';
  if ('Authorization' in authHeaders) {
    authToken = authHeaders.Authorization.substring(7);
  }

  return authToken;
};
