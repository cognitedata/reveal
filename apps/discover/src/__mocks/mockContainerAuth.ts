import { mockCogniteClient } from '__mocks/MockedCogniteClient';

export const TEST_PROJECT = 'testProject';

jest.mock('@cognite/react-container', () => {
  const { ...rest } = jest.requireActual('@cognite/react-container');
  const getCogniteSDKClient = () => mockCogniteClient;
  const getTenantInfo = () => ['testProject'];
  const getProjectInfo = () => ['testProject'];
  const getAuthHeaders = () => ({
    auth: true,
    Authorization: 'Bearer fake-token',
  });
  return {
    ...rest,
    getProjectInfo,
    getTenantInfo,
    getCogniteSDKClient,
    getAuthHeaders,
  };
});
