import { CogniteClient } from '@cognite/sdk';

export const mockClassifierName = 'Test Classifier';
export const mockProject = 'test_mock_project';
export const mockSdk = new CogniteClient({
  appId: 'fusion.cognite.com',
  project: 'test_mock_project',
  apiKeyMode: true,
  getToken: () => Promise.resolve('token'),
});
