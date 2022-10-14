import { CogniteClient } from '@cognite/sdk';
import { BaseArgs, ProjectConfig } from '../types';
import { getAuthToken } from './auth';
import { AUTH_TYPE, CONSTANTS } from '../constants';

let client: CogniteClient;

export const getCogniteSDKClient = () => client as unknown as CogniteClient;

export const setCogniteSDKClient = (newClient: CogniteClient) => {
  client = newClient;
};

export const createSdkClient = (authArgs: ProjectConfig & BaseArgs) => {
  const { cluster, authType, project } = authArgs;
  const baseUrl = `https://${cluster}.cognitedata.com`;
  const appId = CONSTANTS.APP_ID;

  const client = new CogniteClient({
    appId,
    project,
    baseUrl: authType === AUTH_TYPE.APIKEY ? '' : baseUrl,
    apiKeyMode: authType === AUTH_TYPE.APIKEY,
    getToken: getAuthToken(authArgs),
  });

  setCogniteSDKClient(client);

  return client as unknown as CogniteClient;
};
