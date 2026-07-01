/*!
 * Copyright 2021 Cognite AS
 */

import { CadMetadataParser } from './CadMetadataParser';
import type { CadMetadataWithSignedFiles } from './types';

describe('CadMetadataParser', () => {
  const parser = new CadMetadataParser();

  test('No version field, throws', () => {
    const input: CadMetadataWithSignedFiles = {
      type: 'cadMetadataWithSignedFiles',
      signedFiles: { items: [] },
      fileData: {} as any
    };
    expect(() => parser.parse(input)).toThrow();
  });

  test('Version 7 is not supported', () => {
    const input: CadMetadataWithSignedFiles = {
      type: 'cadMetadataWithSignedFiles',
      signedFiles: { items: [] },
      fileData: { version: 7 } as any
    };
    expect(() => parser.parse(input)).toThrow();
  });
});
