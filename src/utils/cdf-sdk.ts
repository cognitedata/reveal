import { CogniteClient } from '@cognite/sdk';

let client: CogniteClient;

export function getSDK() {
  if (!client) {
    client = new CogniteClient({
      appId: 'Cognite Charts',
    });
  }
  return client;
}
