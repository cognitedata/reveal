import {
  getAccessTokenForClientSecret,
  getAccessTokenForDeviceCode,
  getAccessTokenForPKCE,
} from '../common/auth';
import { AUTH_CONFIG, AUTH_TYPE } from '../constants';
import { BaseArgs, ProjectConfig } from '../types';
import { DEBUG } from './logger';

export const getAuthToken = (arg: ProjectConfig & BaseArgs) => async () => {
  const authority = `https://login.microsoftonline.com/${arg.tenant}`;
  const clientId = arg.clientId;
  const baseUrl = `https://${arg.cluster}.cognitedata.com`;

  switch (arg.authType) {
    case AUTH_TYPE.APIKEY: {
      DEBUG('Getting token via APIKEY');
      return arg.apiKey;
    }
    case AUTH_TYPE.PKCE: {
      DEBUG('Getting token via PKCE');
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
        DEBUG('Failed to get token via PKCE');
        throw new Error(
          'Unable to refresh token based on your login, you need to retrigger login once again'
        );
      }
    }
    case AUTH_TYPE.CLIENT_SECRET: {
      DEBUG('Getting token via Client Secret');
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
        DEBUG('Failed to get token via Client Secret');
        throw new Error(
          'Unable to refresh token based on your login, you need to retrigger login once again'
        );
      }
    }
    case AUTH_TYPE.DEVICE_CODE: {
      DEBUG('Getting token via Device Code');
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
        DEBUG('Failed to get token via Device Code');
        throw new Error(
          'Unable to refresh token based on your login, you need to retrigger login once again'
        );
      }
    }
    default:
      throw new Error('Unsupported auth type');
  }
};
