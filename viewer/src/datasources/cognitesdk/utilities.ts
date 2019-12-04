/*!
 * Copyright 2019 Cognite AS
 */

import { Versioned3DFile } from '@cognite/sdk';

export const supportedVersions = [1, 2, 3, 7];

export function getNewestVersionedFile(files: Versioned3DFile[]): Versioned3DFile {
  return files
    .filter(file => supportedVersions.includes(file.version))
    .reduce((newestFile, file) => (file.version > newestFile.version ? file : newestFile), {
      fileId: -1,
      version: -1
    });
}
