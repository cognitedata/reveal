/*!
 * Copyright 2020 Cognite AS
 */

import { HttpHeaders } from '@cognite/sdk/dist/src/utils/http/basicHttpClient';
import { Versioned3DFile, HttpError } from '@cognite/sdk';

export const supportedVersions = [8];

export function getNewestVersionedFile(files: Versioned3DFile[]): Versioned3DFile {
  return files
    .filter(file => supportedVersions.includes(file.version))
    .reduce((newestFile, file) => (file.version > newestFile.version ? file : newestFile), {
      fileId: -1,
      version: -1
    });
}

export async function getCadSectorFile(
  blobUrl: string,
  fileName: string,
  defaultHeaders: HttpHeaders
): Promise<ArrayBuffer> {
  const url = `${blobUrl}/${fileName}`;
  const headers = {
    ...defaultHeaders,
    Accept: '*/*'
  };
  const request = { headers, method: 'GET' };
  return (
    fetch(url, request)
      // Retry 3 times
      .catch(() => fetch(url, request))
      .catch(() => fetch(url, request))
      .catch(() => fetch(url, request))
      .then(x => x.arrayBuffer())
  );
}

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
