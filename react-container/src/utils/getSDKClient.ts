import { CogniteClient } from '@cognite/sdk';

let client: CogniteClient;

export const getCogniteSDKClient = () => client;

export const configureCogniteSDKClient = (
  appId?: string,
  cdfApiBaseUrl?: string,
  options?: {
    baseUrl?: string;
  }
) => {
  if (client) {
    return client;
  }

  client = new CogniteClient({ appId: appId || '' });

  if (options && options.baseUrl) {
    client.setBaseUrl(options.baseUrl);
  } else if (cdfApiBaseUrl) {
    client.setBaseUrl(cdfApiBaseUrl);
  }

  return client;
};
