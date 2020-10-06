import { CogniteClient } from '@cognite/sdk';

let client = () => new CogniteClient({ appId: 'invalid' });

export const getSDK = () => {
  return client();
};

export const setSDK = (newClient: CogniteClient) => {
  client = () => newClient;
};
