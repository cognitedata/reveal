import { ConfidentialClientApplication } from '@azure/msal-node';
import decode, { JwtPayload } from 'jwt-decode';

export type AccessTokenRequest = {
  clientId: string;
  clientSecret: string;
  authority: string;
  scopes: string[];
};
export const getAccessTokenForClientSecret = async (
  request: AccessTokenRequest
) => {
  const { clientId, clientSecret, authority, scopes } = request;
  return new ConfidentialClientApplication({
    auth: { clientId, clientSecret },
  }).acquireTokenByClientCredential({ scopes, authority });
};

export const isTokenExpired = (token: string) =>
  Date.now() >= (<JwtPayload>decode(token)).exp * 1000;
