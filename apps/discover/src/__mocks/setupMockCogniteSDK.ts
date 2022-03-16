import { TEST_PROJECT } from 'setupTests';

import { CogniteClient } from '@cognite/sdk';

import { SIDECAR } from 'constants/app';

import { setClient } from '../utils/getCogniteSDKClient';

const client = new CogniteClient({
  project: TEST_PROJECT,
  appId: SIDECAR.applicationId,
  baseUrl: SIDECAR.cdfApiBaseUrl,
  getToken: () => Promise.resolve('123'),
});

setClient(client);
