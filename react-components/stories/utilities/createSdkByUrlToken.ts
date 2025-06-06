import { CogniteClient } from '@cognite/sdk';

export function createSdkByUrlToken(): CogniteClient {
  const token = new URLSearchParams(window.location.search).get('token');
  const project = new URLSearchParams(window.location.search).get('project') ?? '3d-test';
  const baseUrl =
    new URLSearchParams(window.location.search).get('baseUrl') ??
    'https://greenfield.cognitedata.com';
  if (token !== null) {
    return new CogniteClient({
      appId: 'reveal-react-components.stories',
      baseUrl,
      project,
      getToken: async () => await Promise.resolve(token)
    });
  }
  return new CogniteClient({
    appId: 'reveal-react-components.stories',
    baseUrl: '',
    project: '',
    getToken: async () => await Promise.resolve('')
  });
}
