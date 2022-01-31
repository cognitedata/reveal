import { AuthenticationResult } from '@azure/msal-node';
import decode, { JwtPayload } from 'jwt-decode';
import { AUTH_CONFIG } from '../../constants';
import { setProjectConfig } from '../../utils/config';

export const handleResponse = async (
  response: AuthenticationResult | null
): Promise<AuthenticationResult> => {
  console.log('handleResponse: ', response);
  setProjectConfig({
    [AUTH_CONFIG.ACCOUNT_INFO]: JSON.stringify(response.account),
  });
  return response;
};

export const isTokenExpired = (token: string) =>
  Date.now() >= (<JwtPayload>decode(token)).exp * 1000;
