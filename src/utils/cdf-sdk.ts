import { CogniteClient } from '@cognite/sdk';
import Config from 'models/charts/config/classes/Config';

let client: CogniteClient;

export function getSDK() {
  if (!client) {
    client = new CogniteClient({
      appId: `Cognite Charts ${Config.version}`,
    });
  }
  return client;
}
