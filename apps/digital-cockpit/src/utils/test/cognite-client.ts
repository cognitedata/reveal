import { CogniteClient } from '@cognite/sdk';

export const cogniteClient = new CogniteClient({
  appId: 'mock-client',
  project: '',
  getToken: () => Promise.resolve(''),
});
// Hack our way in without needing to actually do anything.
// We need this so that we can mock CogniteClient's function without having to login
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
cogniteClient.initAPIs();
