import {
  getAccessTokenForClientSecret,
  getAccessTokenForDeviceCode,
  getAccessTokenForPKCE,
} from '../common/auth';
import { AUTH_CONFIG, AUTH_TYPE } from '../constants';
import { BaseArgs, ProjectConfig } from '../types';

export const getAuthToken = (arg: ProjectConfig & BaseArgs) => async () => {
  const authority = `https://login.microsoftonline.com/${arg.tenant}`;
  const clientId = arg.clientId;
  const baseUrl = `https://${arg.cluster}.cognitedata.com`;

  switch (arg.authType) {
    case AUTH_TYPE.APIKEY: {
      return arg.apiKey;
    }
    case AUTH_TYPE.PKCE: {
      try {
        return (
          await getAccessTokenForPKCE({
            authority,
            clientId,
            baseUrl,
            account: arg[AUTH_CONFIG.ACCOUNT_INFO],
            logger: arg.logger,
          })
        ).accessToken;
      } catch {
        throw new Error(
          'Unable to refresh token based on your login, you need to retrigger login once again'
        );
      }
    }
    case AUTH_TYPE.CLIENT_SECRET: {
      const token = (
        await getAccessTokenForClientSecret({
          authority,
          clientId,
          baseUrl,
          clientSecret: arg.clientSecret,
          logger: arg.logger,
        })
      ).accessToken;

      if (token) {
        return token;
      } else {
        throw new Error(
          'Unable to refresh token based on your login, you need to retrigger login once again'
        );
      }
    }
    case AUTH_TYPE.DEVICE_CODE: {
      try {
        return (
          await getAccessTokenForDeviceCode({
            authority,
            clientId,
            baseUrl,
            account: arg[AUTH_CONFIG.ACCOUNT_INFO],
            logger: arg.logger,
          })
        ).accessToken;
      } catch {
        throw new Error(
          'Unable to refresh token based on your login, you need to retrigger login once again'
        );
      }
    }
    default:
      throw new Error('Unsupported auth type');
  }
};
