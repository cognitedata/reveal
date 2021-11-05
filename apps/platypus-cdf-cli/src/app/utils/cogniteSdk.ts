import { CogniteClient } from '@cognite/sdk-v6';
import { ProjectConfig } from '../types';
import { getAuthToken } from './auth';

let client: CogniteClient;

export const getCogniteSDKClient = () => client;

export const setCogniteSDKClient = (newClient: CogniteClient) => {
  client = newClient;
};

export const createSdkClient = (authArgs: ProjectConfig) => {
  const baseUrl = `https://${authArgs.cluster}.cognitedata.com`;
  const appId = 'Platypus';
  const project = 'platypus';

  const client = new CogniteClient({
    appId,
    project,
    baseUrl,
    getToken: getAuthToken(authArgs),
  });

  setCogniteSDKClient(client);

  return client;
};
