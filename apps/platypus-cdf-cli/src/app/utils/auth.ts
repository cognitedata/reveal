import {
  ConfidentialClientApplication,
  PublicClientApplication,
} from '@azure/msal-node';
import { AUTH_TYPE, CONFIG_KEY, LOGIN_STATUS } from '../constants';
import { ProjectConfig } from '../types';
import { setProjectConfigItem } from './config';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const open = require('open');

export const getAuthToken = (arg: ProjectConfig) => async () => {
  const authority = `https://login.microsoftonline.com/${arg.tenant}`;
  const clientId = arg.clientId;
  const baseUrl = `https://${arg.cluster}.cognitedata.com`;
  const scopes = [`${baseUrl}/.default`];

  if (arg.authType.toString() === AUTH_TYPE.CLIENT_SECRET.toString()) {
    const token = (
      await new ConfidentialClientApplication({
        auth: { clientId, authority, clientSecret: arg.clientSecret },
      }).acquireTokenByClientCredential({
        scopes,
        skipCache: true,
      })
    ).accessToken;

    if (token) {
      setProjectConfigItem(CONFIG_KEY.AUTH_TYPE, AUTH_TYPE.CLIENT_SECRET);
      setProjectConfigItem(CONFIG_KEY.AUTH_TOKEN, token);
      setProjectConfigItem(CONFIG_KEY.LOGIN_STATUS, LOGIN_STATUS.SUCCESS);
      return token;
    } else {
      setProjectConfigItem(CONFIG_KEY.LOGIN_STATUS, LOGIN_STATUS.FAILED);
      throw new Error(
        'Unable to refresh token based on your login, you need to retrigger login once again, try $ platypus login'
      );
    }
  }

  return (
    await new PublicClientApplication({
      auth: { clientId, authority },
    }).acquireTokenByDeviceCode({
      scopes,
      deviceCodeCallback: ({ verificationUri, userCode, message }) => {
        open(verificationUri)
          .then(() =>
            console.log(`Please enter the code in browser: ${userCode}`)
          )
          .catch(() => console.log(`Failed to verify, ${message}`));
      },
    })
  ).accessToken;
};
