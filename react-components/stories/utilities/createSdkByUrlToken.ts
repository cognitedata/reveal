/*!
 * Copyright 2023 Cognite AS
 */
import { CogniteClient } from '@cognite/sdk';

export function createSdkByUrlToken(
  baseUrl = 'https://greenfield.cognitedata.com',
  project = '3d-test'
): CogniteClient {
  const token = new URLSearchParams(window.location.search).get('token') ?? '';
  if (token === '') {
    console.warn(
      'No token provided in URL. Please provide a token in the URL as a query parameter named "token".'
    );
  }
  return new CogniteClient({
    appId: 'reveal.example',
    baseUrl,
    project,
    getToken: async () => await Promise.resolve(token)
  });
}
