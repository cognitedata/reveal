import { CogniteClient } from '@cognite/sdk';

// eslint-disable-next-line import/no-mutable-exports
export let client: CogniteClient;

export const getCogniteSDKClient = () => client;

export const setCogniteSDKClient = (newClient: CogniteClient) => {
  client = newClient;
};
