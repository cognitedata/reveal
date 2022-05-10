import { CogniteClient } from '@cognite/sdk';
import sidecar from 'utils/sidecar';

let client: CogniteClient;
const TEST_PROJECT = 'test-project';

export const getTestCogniteClient = (project = TEST_PROJECT): CogniteClient => {
  if (!client) {
    authenticateCogniteClient(project);
  }
  return client;
};

export const authenticateCogniteClient = (project = TEST_PROJECT) => {
  client = new CogniteClient({
    appId: sidecar.applicationId,
    baseUrl: sidecar.cdfApiBaseUrl,
    project,
    getToken: async () => '',
  });
};
