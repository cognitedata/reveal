import { TEST_PROJECT } from '__mocks/mockContainerAuth';
import { SIDECAR } from 'constants/app';
import { setEnableWellSDKV3 } from 'modules/wellSearch/sdk';
import { authenticateWellSDK } from 'modules/wellSearch/sdk/v3';

setEnableWellSDKV3(true);
authenticateWellSDK(
  SIDECAR.applicationId,
  SIDECAR.cdfApiBaseUrl,
  TEST_PROJECT,
  'test-token'
);

export {};
