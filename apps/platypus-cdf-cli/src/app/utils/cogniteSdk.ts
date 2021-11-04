import { CogniteClient } from '@cognite/sdk-v6';
import { DefaultArgs } from '../types';
import { getAuthToken } from './auth';

let client: CogniteClient;

export const getCogniteSDKClient = () => client;

export const setCogniteSDKClient = (newClient: CogniteClient) => {
  client = newClient;
};

export const createSdkClient = (args: DefaultArgs) => {
  const authArgs = {
    clientId: args.clientId || '4770c0f1-7bb6-43b5-8c37-94f2a9306757',
    clientSecret: args.clientSecret,
    cluster: args.cluster || 'greenfield',
    project: args.project || 'platypus',
    tenant: args.tenant || 'cogniteappdev.onmicrosoft.com',
    useClientSecret: args.useClientSecret || true,
  } as DefaultArgs;

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
