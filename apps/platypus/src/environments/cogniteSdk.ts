import { CogniteClient } from '@cognite/sdk';

let client: CogniteClient;

export const getCogniteSDKClient = () => client;

export const setCogniteSDKClient = (newClient: CogniteClient) => {
  client = newClient;
};
