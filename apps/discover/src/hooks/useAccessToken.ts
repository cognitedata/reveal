import { useJsonHeaders } from 'services/service';

export const useAccessToken = () => {
  const authHeaders = useJsonHeaders();

  let authToken = '';
  if ('Authorization' in authHeaders) {
    authToken = authHeaders.Authorization.substring(7);
  }

  return authToken;
};
