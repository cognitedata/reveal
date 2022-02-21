import { TEST_PROJECT } from '__mocks/mockContainerAuth';
import { SIDECAR } from 'constants/app';
import { authenticateDocumentSDK } from 'modules/documentSearch/sdk';

authenticateDocumentSDK(
  'discover-test',
  `https://${SIDECAR.cdfCluster}.cognitedata.com`,
  TEST_PROJECT,
  'test-token'
);

export {};
