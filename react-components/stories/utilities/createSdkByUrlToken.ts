/*!
 * Copyright 2023 Cognite AS
 */
import { CogniteClient } from '@cognite/sdk';

export function createSdkByUrlToken(): CogniteClient {
  const token = new URLSearchParams(window.location.search).get('token');
  const project = new URLSearchParams(window.location.search).get('project') ?? 'lervik-industries';
  const baseUrl =
    new URLSearchParams(window.location.search).get('baseUrl') ?? 'https://api.cognitedata.com';
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
