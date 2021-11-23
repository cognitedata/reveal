import { getAccessTokenForClientSecret } from '../common/auth';
import { AUTH_TYPE } from '../constants';
import { ProjectConfig } from '../types';

export const getAuthToken = (arg: ProjectConfig) => async () => {
  const authority = `https://login.microsoftonline.com/${arg.tenant}`;
  const clientId = arg.clientId;
  const baseUrl = `https://${arg.cluster}.cognitedata.com`;
  const scopes = [`${baseUrl}/.default`];

  if (arg.authType === AUTH_TYPE.LEGACY) {
    return arg.apiKey;
  }

  if (arg.authType === AUTH_TYPE.CLIENT_SECRET) {
    const token = (
      await getAccessTokenForClientSecret({
        authority,
        clientId,
        clientSecret: arg.clientSecret,
        scopes,
      })
    ).accessToken;

    if (token) {
      return token;
    } else {
      throw new Error(
        'Unable to refresh token based on your login, you need to retrigger login once again, try $ platypus login'
      );
    }
  }

  throw new Error('Unsupported auth type');
};
