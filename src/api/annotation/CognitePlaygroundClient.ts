import { CogniteClientPlayground } from '@cognite/sdk-playground';
import { getProject } from '@cognite/cdf-utilities';
import sdk, { getToken } from '@cognite/cdf-sdk-singleton';

const subAppName = 'cdf-vision-subapp';

export const cognitePlaygroundClient = new CogniteClientPlayground({
  appId: subAppName,
  baseUrl: sdk.getBaseUrl(),
  project: getProject(),
  getToken: () => getToken(),
});

cognitePlaygroundClient.authenticate();
