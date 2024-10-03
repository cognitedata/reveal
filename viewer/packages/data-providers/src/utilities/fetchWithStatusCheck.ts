/*!
 * Copyright 2021 Cognite AS
 */

import { HttpError } from '@cognite/sdk';

export const supportedVersions = [8];

export async function fetchWithStatusCheck(url: string): Promise<Response> {
  const response = await fetch(url);
  if (!response.ok) {
    const headers: { [key: string]: string } = {};
    response.headers.forEach((key, value) => {
      headers[key] = value;
    });
    throw new HttpError(response.status, response.body as any, headers);
  }
  return response;
}
