import { CogniteClient } from 'cognite-sdk-v3';

let client = () => new CogniteClient({ appId: 'invalid' });

export const getSDK = () => {
  return client();
};

export const setSDK = (newClient: CogniteClient) => {
  client = () => newClient;
};
