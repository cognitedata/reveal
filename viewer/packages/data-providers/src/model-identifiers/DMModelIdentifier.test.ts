/*!
 * Copyright 2025 Cognite AS
 */

import { DMModelIdentifier } from './DMModelIdentifier';

describe(DMModelIdentifier.name, () => {
  const mockParams = {
    modelId: 12345,
    revisionId: 67890,
    revisionExternalId: 'test-revision-external-id',
    revisionSpace: 'test-space'
  };

  let dmModelIdentifier: DMModelIdentifier;

  beforeEach(() => {
    dmModelIdentifier = new DMModelIdentifier(mockParams);
  });

  test('should create instance with correct properties', () => {
    expect(dmModelIdentifier.modelId).toBe(mockParams.modelId);
    expect(dmModelIdentifier.revisionId).toBe(mockParams.revisionId);
    expect(dmModelIdentifier.revisionExternalId).toBe(mockParams.revisionExternalId);
    expect(dmModelIdentifier.revisionSpace).toBe(mockParams.revisionSpace);
    expect(dmModelIdentifier.revealInternalId).toBeDefined();
    expect(typeof dmModelIdentifier.revealInternalId).toBe('symbol');
  });

  test('should create unique symbols for different instances', () => {
    const identifier1 = new DMModelIdentifier({
      ...mockParams,
      revisionExternalId: 'revision-external-id-1',
      revisionSpace: 'space-1'
    });
    const identifier2 = new DMModelIdentifier({
      ...mockParams,
      revisionExternalId: 'revision-external-id-2',
      revisionSpace: 'space-2'
    });

    expect(identifier1.revealInternalId).not.toBe(identifier2.revealInternalId);
  });

  test('should return formatted string with class name and internal id', () => {
    const result = dmModelIdentifier.toString();

    expect(result).toMatch(/^DMModelIdentifier \(Symbol\(test-space\/test-revision-external-id\)\)$/);
    expect(result).toContain('DMModelIdentifier');
    expect(result).toContain('Symbol(test-space/test-revision-external-id)');
  });

  test('should return formatted source model identifier string', () => {
    const result = dmModelIdentifier.sourceModelIdentifier();

    expect(result).toBe('cdf-dm: test-space/test-revision-external-id');
  });

  test('should handle special characters in revision space and external ID', () => {
    const identifier = new DMModelIdentifier({
      ...mockParams,
      revisionExternalId: 'revision-external-id-with-dashes_and_underscores',
      revisionSpace: 'revision-space-with-special.chars'
    });

    const result = identifier.sourceModelIdentifier();

    expect(result).toBe('cdf-dm: revision-space-with-special.chars/revision-external-id-with-dashes_and_underscores');
  });
});
