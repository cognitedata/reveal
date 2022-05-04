import { mockCogniteClient } from './getMockCogniteClient';

jest.mock('@cognite/react-container', () => {
  const { ...rest } = jest.requireActual('@cognite/react-container');
  const getCogniteSDKClient = () => mockCogniteClient;
  const getTenantInfo = () => ['testProject'];
  const getAuthHeaders = () => ({
    auth: true,
    Authorization: 'Bearer fake-token',
  });
  return { ...rest, getTenantInfo, getCogniteSDKClient, getAuthHeaders };
});
