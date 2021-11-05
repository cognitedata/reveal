import { CogniteClient } from '@cognite/sdk-v6';
import { Arguments } from 'yargs';
import { getAccessTokenForClientSecret, isTokenExpired } from '../common/auth';
import { AUTH_TYPE, CONFIG_KEY, LOGIN_STATUS } from '../constants';
import { BaseArgs } from '../types';
import {
  createSdkClient,
  getCogniteSDKClient,
  setCogniteSDKClient,
} from '../utils/cogniteSdk';
import { getProjectConfig, setProjectConfigItem } from '../utils/config';
import { getCommandName } from '../utils/yargs-utils';

const unAuthenticated = { authenticated: false };

export async function authenticate(arg: Arguments<BaseArgs>) {
  if (getCommandName(arg) === 'login') {
    return unAuthenticated;
  }

  // get stored accessToken, authType and try to login and initialize SDK
  const projectConfig = getProjectConfig();

  if (
    !projectConfig ||
    (projectConfig && projectConfig.loginStatus !== LOGIN_STATUS.SUCCESS)
  ) {
    throw new Error(
      'You need to login first! try $ platypus login to initiate login'
    );
  }

  if (projectConfig.authType === AUTH_TYPE.CLIENT_SECRET) {
    let client = getCogniteSDKClient();
    if (!client) {
      client = createSdkClient(projectConfig);
    }

    await client.authenticate();
    setCogniteSDKClient(client);
  } else {
    if (!isTokenExpired(projectConfig.authToken)) {
      console.log('existing token is valid continuing with the same');
      return;
    }

    setProjectConfigItem(CONFIG_KEY.LOGIN_STATUS, LOGIN_STATUS.FAILED);

    throw new Error(
      'Currently only able to refresh token for --use-client-secret based login please login again with $ platypus login --use-client-secret --client-secret=<secret>'
    );
  }
}
