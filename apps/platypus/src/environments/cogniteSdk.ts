import { CogniteClient } from '@cognite/sdk';

let client: CogniteClient;

export const getCogniteSDKClient = () => client;

export const setCogniteSDKClient = (newClient: CogniteClient) => {
  client = newClient;
};

export const getUserInfo = () => {
  return Promise.resolve({
    id: '',
    mail: '',
    displayName: '',
  });
};
