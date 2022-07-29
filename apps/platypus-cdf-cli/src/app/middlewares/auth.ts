import { Arguments } from 'yargs';
import { BaseArgs, ProjectConfig } from '../types';
import { CogniteClient } from '@cognite/sdk-v6';
import {
  createSdkClient,
  getCogniteSDKClient,
  setCogniteSDKClient,
} from '../utils/cogniteSdk';
import {
  getProjectConfig,
  setProjectConfig,
  setProjectConfigItem,
} from '../utils/config';
import {
  AUTH_CONFIG,
  AUTH_TYPE,
  LOGIN_STATUS,
  ROOT_CONFIG_KEY,
} from '../constants';
import { getCommandName } from '../utils/yargs-utils';
import { skipMiddleware } from './util';
import logout from '../common/auth/logout';
import logger, { DEBUG as _DEBUG } from '../utils/logger';

const DEBUG = _DEBUG.extend('middleware:auth');

export async function authenticate(arg: Arguments<BaseArgs>) {
  try {
    // skip auth check for some commands
    if (skipMiddleware(arg)) {
      return;
    }
    // for `login` command, rerunning should retrigger signin, hence we should clear cached tokens and config
    // as well, inject a default clientId
    if (getCommandName(arg) === 'login' || getCommandName(arg) === 'signin') {
      logger.info(
        'Logging out the current user and clearing the config (if exists)'
      );
      logout();

      arg.authType = AUTH_TYPE.PKCE;
      arg['auth-type'] = AUTH_TYPE.PKCE;

      if (arg.apiKey) {
        arg.authType = AUTH_TYPE.APIKEY;
        arg['auth-type'] = AUTH_TYPE.APIKEY;
      }
      if (arg.clientSecret) {
        arg.authType = AUTH_TYPE.CLIENT_SECRET;
        arg['auth-type'] = AUTH_TYPE.CLIENT_SECRET;
      }
      if (arg.deviceCode) {
        arg.authType = AUTH_TYPE.DEVICE_CODE;
        arg['auth-type'] = AUTH_TYPE.DEVICE_CODE;
      }

      if (
        (arg.authType === AUTH_TYPE.PKCE ||
          arg.authType === AUTH_TYPE.DEVICE_CODE) &&
        !arg.clientId
      ) {
        arg.clientId = getDefaultClientIdForPKCE(arg.cluster as string);
      }
    }

    // get stored accessToken, authType and try to login and initialize SDK
    const storedProjectConfig = getProjectConfig();

    const projectConfig = { ...storedProjectConfig, ...arg } as ProjectConfig &
      BaseArgs;

    let client = getCogniteSDKClient();
    if (!client) {
      client = createSdkClient(projectConfig);
    }

    DEBUG('Fetching auth token from CDF...');

    const token = await (client as unknown as CogniteClient).authenticate();

    if (token === undefined) {
      DEBUG('Unable to fetch token from CDF (came back undefined');
      throw new Error('Failed to authenticate against CDF.');
    }

    DEBUG('Finished fetching auth token from CDF');

    setProjectConfig({
      [AUTH_CONFIG.LOGIN_STATUS]: LOGIN_STATUS.SUCCESS,
      [AUTH_CONFIG.CLIENT_SECRET]: projectConfig.clientSecret,
      [AUTH_CONFIG.CLIENT_ID]: projectConfig.clientId,
      [AUTH_CONFIG.CLUSTER]: projectConfig.cluster,
      [AUTH_CONFIG.TENANT]: projectConfig.tenant,
      [AUTH_CONFIG.PROJECT]: projectConfig.project,
      [AUTH_CONFIG.AUTH_TYPE]: projectConfig.authType,
      [AUTH_CONFIG.API_KEY]: projectConfig.apiKey,
    });

    setCogniteSDKClient(client);
  } catch (error) {
    setProjectConfigItem(ROOT_CONFIG_KEY.AUTH, undefined);
    throw new Error(
      'Failed to authenticate you, please make sure you use correct credentials for the login'
    );
  }
}

export const getDefaultClientIdForPKCE = (cluster: string) => {
  switch (cluster) {
    case 'greenfield':
      return '4770c0f1-7bb6-43b5-8c37-94f2a9306757';
    case 'bluefield':
      return 'a7869455-32f2-4a07-b568-8485b9b887f0';
    case 'api':
    case 'europe-west1-1':
      return '6890be09-b7c9-4500-b020-c3cb762d14cc';
  }
};
