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
import { AUTH_CONFIG, LOGIN_STATUS, ROOT_CONFIG_KEY } from '../constants';
import { getCommandName } from '../utils/yargs-utils';
import { skipMiddleware } from './util';

export async function authenticate(arg: Arguments<BaseArgs>) {
  try {
    // skip auth check for some commands
    if (skipMiddleware(arg)) {
      return;
    }
    // get stored accessToken, authType and try to login and initialize SDK
    const storedProjectConfig = getProjectConfig();

    const projectConfig = { ...storedProjectConfig, ...arg } as ProjectConfig &
      BaseArgs;

    // for `login` command, rerunning should retrigger signin, hence we should clear cache
    if (getCommandName(arg) === 'login') {
      delete projectConfig[AUTH_CONFIG.MSAL_AUTH_CACHE];
      delete projectConfig[AUTH_CONFIG.ACCOUNT_INFO];
    }

    console.log('projectConfig: ', projectConfig);

    let client = getCogniteSDKClient();
    if (!client) {
      client = createSdkClient(projectConfig);
    }

    await (client as unknown as CogniteClient).authenticate();

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
