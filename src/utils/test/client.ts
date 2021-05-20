import { createApiClient, createClient, ApiClient } from 'utils';
import { CdfClient } from 'utils/cdfClient';

export const createMockCdfClient = (): CdfClient => {
  const cdfClient = createClient({
    appId: 'unit-tests',
    dataSetName: '',
  });
  // Hack our way in without needing to actually do anything.
  // We need this so that we can mock CogniteClient's function without having to login
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  cdfClient.cogniteClient.initAPIs();
  return cdfClient;
};

export const createMockApiClient = (): ApiClient => {
  const apiClient = createApiClient({ appId: 'unit-tests', baseUrl: '' });
  return apiClient;
};
