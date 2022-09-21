/*!
 * Copyright 2021 Cognite AS
 */

// To avoid direct dependency on @cognite/sdk we use sdk-core here for HttpError.
// that's why it's avoided https://github.com/cognitedata/cdf-hub/pull/687/files#r489204315
import { HttpError } from '@cognite/sdk-core';

export const supportedVersions = [8];

export async function fetchWithStatusCheck(url: string): Promise<Response> {
  const response = await fetch(url);
  if (!response.ok) {
    const headers: { [key: string]: string } = {};
    response.headers.forEach((key, value) => {
      headers[key] = value;
    });
    throw new HttpError(response.status, response.body, headers);
  }
  return response;
}
