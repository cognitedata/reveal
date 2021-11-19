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
import { CONFIG_KEY, LOGIN_STATUS } from '../constants';

export async function authenticate(arg: Arguments<BaseArgs>) {
  try {
    // get stored accessToken, authType and try to login and initialize SDK
    const storedProjectConfig = getProjectConfig();

    const projectConfig = { ...storedProjectConfig, ...arg } as ProjectConfig;

    let client = getCogniteSDKClient();
    if (!client) {
      client = createSdkClient(projectConfig);
    }

    const token = await (client as unknown as CogniteClient).authenticate();
    await client.assets.list();
    setProjectConfig(projectConfig, token);
    setCogniteSDKClient(client);
  } catch (error) {
    setProjectConfigItem(CONFIG_KEY.LOGIN_STATUS, LOGIN_STATUS.UNAUTHENTICATED);
    throw new Error(
      'Failed to authenticate you, please make sure you use correct credentials for the login'
    );
  }
}
