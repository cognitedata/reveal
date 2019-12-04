/*!
 * Copyright 2019 Cognite AS
 */

import { getNewestVersionedFile } from '../../../datasources/cognitesdk/utilities';
import { Versioned3DFile } from '@cognite/sdk';

describe('getNewestVersionedFile', () => {
  test('No files', () => {
    const versionedFile = getNewestVersionedFile([]);
    expect(versionedFile).toMatchObject({ version: -1, fileId: -1 });
  });

  test('Two versions, returns newest', () => {
    const files: Versioned3DFile[] = [{ version: 2, fileId: 9 }, { version: 7, fileId: 10 }];
    const version = getNewestVersionedFile(files);
    expect(version).toMatchObject({ fileId: 10, version: 7 });
  });

  test('Versions newer than supported, returns last supported', () => {
    const files: Versioned3DFile[] = [
      { version: 2, fileId: 9 },
      { version: 7, fileId: 10 },
      { version: 8, fileId: 11 }
    ];
    const version = getNewestVersionedFile(files);
    expect(version).toMatchObject({ fileId: 10, version: 7 });
  });

  test('Newest version is discarded version, returns last supported', () => {
    const files: Versioned3DFile[] = [
      { version: 2, fileId: 9 },
      { version: 3, fileId: 10 },
      { version: 4, fileId: 11 }
    ];
    const version = getNewestVersionedFile(files);
    expect(version).toMatchObject({ fileId: 10, version: 3 });
  });
});
