import { CogniteClientPlayground } from '@cognite/sdk-playground';
import { getProject } from '@cognite/cdf-utilities';
import sdk, { getToken } from '@cognite/cdf-sdk-singleton';

export const cognitePlaygroundClient = new CogniteClientPlayground({
  appId: sdk.project,
  baseUrl: sdk.getBaseUrl(),
  project: getProject(),
  getToken: () => getToken(),
});

cognitePlaygroundClient.authenticate();
