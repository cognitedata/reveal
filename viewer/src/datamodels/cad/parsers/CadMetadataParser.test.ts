/*!
 * Copyright 2021 Cognite AS
 */

import { CadMetadataParser } from './CadMetadataParser';

describe('CadMetadataParser', () => {
  const parser = new CadMetadataParser();

  test('No version field, throws', () => {
    expect(() => parser.parse({})).toThrowError();
  });

  test('Version 7 is not supported', () => {
    expect(() => parser.parse({ version: 7 })).toThrow();
  });
});
