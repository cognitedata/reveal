/*!
 * Copyright 2020 Cognite AS
 */

import { Versioned3DFile } from '@cognite/sdk';
import { HttpHeaders } from '@cognite/sdk/dist/src/utils/http/basicHttpClient';

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
  const response = await fetch(url, { headers, method: 'GET' })
    // Retry 3 times
    .catch(() => fetch(url, { headers, method: 'GET' }))
    .catch(() => fetch(url, { headers, method: 'GET' }))
    .catch(() => fetch(url, { headers, method: 'GET' }));
  return response.arrayBuffer();
}
