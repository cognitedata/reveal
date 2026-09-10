/*!
 * Copyright 2021 Cognite AS
 */

import type { MetadataWithSignedFiles } from '@reveal/data-providers';
import { CadMetadataParser } from './CadMetadataParser';
import type { CadSceneRootMetadata } from './parsers/types';

describe('CadMetadataParser', () => {
  const parser = new CadMetadataParser();

  test('No version field, throws', () => {
    const input: MetadataWithSignedFiles<CadSceneRootMetadata> = {
      signedFiles: { items: [] },
      fileData: {} as Partial<CadSceneRootMetadata> as CadSceneRootMetadata
    };
    expect(() => parser.parse(input)).toThrow();
  });

  test('Version 7 is not supported', () => {
    const input: MetadataWithSignedFiles<CadSceneRootMetadata> = {
      signedFiles: { items: [] },
      fileData: { version: 7 } as Partial<CadSceneRootMetadata> as CadSceneRootMetadata
    };
    expect(() => parser.parse(input)).toThrow();
  });
});
