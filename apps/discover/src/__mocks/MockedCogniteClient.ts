import { CogniteClient } from '@cognite/sdk';

import { SIDECAR } from '../constants/app';
import { TEST_PROJECT } from '../setupTests';

export const mockCogniteClient = new CogniteClient({
  appId: 'test-app',
  project: TEST_PROJECT,
  getToken: () => Promise.resolve('mock token'),
  baseUrl: SIDECAR.cdfApiBaseUrl,
});
