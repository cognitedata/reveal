import { CogniteClient } from '@cognite/sdk';

export const project = 'test';

const v3ClientAuthorized = new CogniteClient({
  appId: 'test',
  project: 'test',
  apiKey: 'fakeApiKey',
});

// that's only done to overcome sdk auth checks
// every request will return 401 but they should be mocked in tests
v3ClientAuthorized.loginWithApiKey({
  project: 'test',
  apiKey: 'fakeApiKey',
});

export const v3Client = v3ClientAuthorized;
