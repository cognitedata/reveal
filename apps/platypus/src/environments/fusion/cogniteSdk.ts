import sdk, { getUserInformation } from '@cognite/cdf-sdk-singleton';
import { CogniteClient } from '@cognite/sdk';

let client: CogniteClient = sdk;

export const getCogniteSDKClient = () => client;

export const setCogniteSDKClient = (newClient: CogniteClient) => {
  client = newClient;
};

export const getUserInfo = () => {
  return getUserInformation();
};
