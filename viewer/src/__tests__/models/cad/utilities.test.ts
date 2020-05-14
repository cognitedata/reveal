/*!
 * Copyright 2020 Cognite AS
 */

import { getNewestVersionedFile } from '../../../utilities/networking/utilities';
import { Versioned3DFile } from '@cognite/sdk';

describe('getNewestVersionedFile', () => {
  test('No files', () => {
    const versionedFile = getNewestVersionedFile([]);
    expect(versionedFile).toMatchObject({ version: -1, fileId: -1 });
  });

  test('Two versions, returns newest', () => {
    const files: Versioned3DFile[] = [
      { version: 2, fileId: 9 },
      { version: 8, fileId: 10 }
    ];
    const version = getNewestVersionedFile(files);
    expect(version).toMatchObject({ fileId: 10, version: 8 });
  });

  test('Versions newer than supported, returns last supported', () => {
    const files: Versioned3DFile[] = [
      { version: 2, fileId: 9 },
      { version: 7, fileId: 10 },
      { version: 8, fileId: 11 },
      { version: 9, fileId: 13 }
    ];
    const version = getNewestVersionedFile(files);
    expect(version).toMatchObject({ fileId: 11, version: 8 });
  });
});
