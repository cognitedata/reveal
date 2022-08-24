import { CogniteClient } from '@cognite/sdk';
import config from 'config/config';

let client: CogniteClient;

export function getSDK() {
  if (!client) {
    client = new CogniteClient({
      appId: `Cognite Charts ${config.version}`,
    });
  }
  return client;
}
