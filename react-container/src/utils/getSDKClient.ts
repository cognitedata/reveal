import { CogniteClient } from '@cognite/sdk';

let client: CogniteClient;

export const getCogniteSDKClient = () => client;

export const configureCogniteSDKClient = (
  appId?: string,
  options?: {
    baseUrl?: string;
  }
): CogniteClient => {
  if (client) {
    return client;
  }

  client = new CogniteClient({ appId: appId || '' });

  if (options && options.baseUrl) {
    client.setBaseUrl(options.baseUrl);
  }

  return client;
};
