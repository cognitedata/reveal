/*!
 * Copyright 2026 Cognite AS
 */

import { stripRestrictedApiGateway } from './signedUrlUtils';

describe(stripRestrictedApiGateway.name, () => {
  test('strips restricted-api prefix from https URL', () => {
    const result = stripRestrictedApiGateway('https://restricted-api.storage.cognite.com/path/file.glb?token=abc');
    expect(result).toBe('https://storage.cognite.com/path/file.glb?token=abc');
  });

  test('returns URL unchanged when prefix is absent', () => {
    const url = 'https://storage.cognite.com/path/file.glb?token=abc';
    expect(stripRestrictedApiGateway(url)).toBe(url);
  });

  test('does not strip when restricted-api appears in path, not hostname', () => {
    const url = 'https://storage.cognite.com/restricted-api/file.glb';
    expect(stripRestrictedApiGateway(url)).toBe(url);
  });

  test('handles http URLs', () => {
    const result = stripRestrictedApiGateway('http://restricted-api.storage.cognite.com/file.glb');
    expect(result).toBe('http://storage.cognite.com/file.glb');
  });
});
