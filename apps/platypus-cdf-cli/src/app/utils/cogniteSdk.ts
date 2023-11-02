import { CogniteClient } from '@cognite/sdk';

import { CONSTANTS } from '../constants';
import { BaseArgs, ProjectConfig } from '../types';

import { getAuthToken } from './auth';

let client: CogniteClient;

export const getCogniteSDKClient = () => client as unknown as CogniteClient;

export const setCogniteSDKClient = (newClient: CogniteClient) => {
  client = newClient;
};

export const createSdkClient = (authArgs: ProjectConfig & BaseArgs) => {
  const { cluster, project } = authArgs;
  const baseUrl = `https://${cluster}.cognitedata.com`;
  const appId = CONSTANTS.APP_ID;

  const client = process.env.TESTING_BASE_URL
    ? new CogniteClient({
        appId,
        project,
        noAuthMode: true,
        baseUrl: process.env.TESTING_BASE_URL,
        getToken: () => Promise.resolve(''),
      })
    : new CogniteClient({
        appId,
        project,
        baseUrl: baseUrl,
        apiKeyMode: false,
        getToken: getAuthToken(authArgs),
      });

  setCogniteSDKClient(client);

  return client as unknown as CogniteClient;
};
