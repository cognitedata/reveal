/*!
 * Copyright 2021 Cognite AS
 */

import { CadMetadataParser } from './CadMetadataParser';
import type { CadMetadataWithSignedFiles } from './types';
import type { CadSceneRootMetadata } from './parsers/types';

describe('CadMetadataParser', () => {
  const parser = new CadMetadataParser();

  test('No version field, throws', () => {
    const input: CadMetadataWithSignedFiles = {
      signedFiles: { items: [] },
      fileData: {} as Partial<CadSceneRootMetadata> as CadSceneRootMetadata
    };
    expect(() => parser.parse(input)).toThrow();
  });

  test('Version 7 is not supported', () => {
    const input: CadMetadataWithSignedFiles = {
      signedFiles: { items: [] },
      fileData: { version: 7 } as Partial<CadSceneRootMetadata> as CadSceneRootMetadata
    };
    expect(() => parser.parse(input)).toThrow();
  });
});
