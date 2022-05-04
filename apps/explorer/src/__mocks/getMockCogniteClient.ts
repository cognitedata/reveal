import { CogniteClient } from '@cognite/sdk';

import SIDECAR from '../utils/sidecar';

export const TEST_PROJECT = 'TEST_PROJECT';

export const mockCogniteClient = new CogniteClient({
  appId: 'test-app',
  project: TEST_PROJECT,
  getToken: () => Promise.resolve('mock token'),
  baseUrl: SIDECAR.cdfApiBaseUrl,
});
