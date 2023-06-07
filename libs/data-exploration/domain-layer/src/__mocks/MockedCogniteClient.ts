import { CogniteClient } from '@cognite/sdk';

export const TEST_PROJECT = 'testProject';

export const mockCogniteClient = new CogniteClient({
  appId: 'test-app',
  project: TEST_PROJECT,
  getToken: () => Promise.resolve('mock token'),
  // baseUrl: 'https://api.cognitedata.com',
});
