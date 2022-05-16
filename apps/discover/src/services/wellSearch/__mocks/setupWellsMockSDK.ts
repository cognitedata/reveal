import { authenticateWellSDK } from 'services/wellSearch/sdk/authenticate';

import { TEST_PROJECT } from '__mocks/mockContainerAuth';
import { SIDECAR } from 'constants/app';

authenticateWellSDK(
  SIDECAR.applicationId,
  SIDECAR.cdfApiBaseUrl,
  TEST_PROJECT,
  'test-token'
);

export {};
