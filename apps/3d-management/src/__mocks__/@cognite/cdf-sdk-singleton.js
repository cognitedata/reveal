import { CogniteClient } from '@cognite/sdk';

export const project = 'test';

const client = new CogniteClient({
  appId: 'test',
  project: 'test',
  apiKeyMode: true,
  getToken: () => Promise.resolve('token'),
  baseUrl: 'https://example.com',
});

export const getFlow = () => ({ flow: 'flow' });

export default client;
