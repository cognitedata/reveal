import { CogniteClient } from '@cognite/sdk';

let globalClient: CogniteClient;

export const setClient = (client: CogniteClient) => {
  globalClient = client;
};

export const getCogniteSDKClient = () => {
  return globalClient;
};
