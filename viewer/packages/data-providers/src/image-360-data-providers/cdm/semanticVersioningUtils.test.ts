/*!
 * Copyright 2025 Cognite AS
 */

import { isSemanticVersion, isSemanticVersionGreaterThanOrEqual } from './semanticVersioningUtils';

describe(isSemanticVersion.name, () => {
  it('should return true for valid semantic versions', () => {
    expect(isSemanticVersion('0.0.0')).toBe(true);
    expect(isSemanticVersion('1.0.0')).toBe(true);
    expect(isSemanticVersion('1.2.3')).toBe(true);
    expect(isSemanticVersion('10.20.30')).toBe(true);
    expect(isSemanticVersion('999.999.999')).toBe(true);
  });

  it('should return false for versions with leading zeros', () => {
    expect(isSemanticVersion('01.0.0')).toBe(false);
    expect(isSemanticVersion('1.01.0')).toBe(false);
    expect(isSemanticVersion('1.0.01')).toBe(false);
  });

  it('should return false for invalid semantic versions', () => {
    expect(isSemanticVersion('')).toBe(false);
    expect(isSemanticVersion('1')).toBe(false);
    expect(isSemanticVersion('1.0')).toBe(false);
    expect(isSemanticVersion('1.0.0.0')).toBe(false);
    expect(isSemanticVersion('a.b.c')).toBe(false);
    expect(isSemanticVersion('1.a.0')).toBe(false);
    expect(isSemanticVersion('v1.0.0')).toBe(false);
    expect(isSemanticVersion('1.0.0-alpha')).toBe(false);
    expect(isSemanticVersion('1.0.0+build')).toBe(false);
  });

  it('should return false for negative numbers', () => {
    expect(isSemanticVersion('-1.0.0')).toBe(false);
    expect(isSemanticVersion('1.-1.0')).toBe(false);
    expect(isSemanticVersion('1.0.-1')).toBe(false);
  });

  it('should return false for versions with whitespace', () => {
    expect(isSemanticVersion(' 1.0.0')).toBe(false);
    expect(isSemanticVersion('1.0.0 ')).toBe(false);
    expect(isSemanticVersion('1. 0.0')).toBe(false);
  });

  it('should return false for decimal numbers', () => {
    expect(isSemanticVersion('1.0.0.5')).toBe(false);
    expect(isSemanticVersion('1.5.0')).toBe(true); // This should be true - it's a valid version
  });
});

describe(isSemanticVersionGreaterThanOrEqual.name, () => {
  describe('exact equality', () => {
    it('should return true when versions are equal', () => {
      expect(isSemanticVersionGreaterThanOrEqual('1.0.0', '1.0.0')).toBe(true);
      expect(isSemanticVersionGreaterThanOrEqual('0.0.0', '0.0.0')).toBe(true);
      expect(isSemanticVersionGreaterThanOrEqual('10.20.30', '10.20.30')).toBe(true);
    });
  });

  describe('major version comparison', () => {
    it('should return true when major version is greater', () => {
      expect(isSemanticVersionGreaterThanOrEqual('2.0.0', '1.0.0')).toBe(true);
      expect(isSemanticVersionGreaterThanOrEqual('10.0.0', '9.0.0')).toBe(true);
    });

    it('should return false when major version is less', () => {
      expect(isSemanticVersionGreaterThanOrEqual('1.0.0', '2.0.0')).toBe(false);
      expect(isSemanticVersionGreaterThanOrEqual('1.9.9', '2.0.0')).toBe(false);
    });
  });

  describe('minor version comparison', () => {
    it('should return true when major is equal and minor is greater', () => {
      expect(isSemanticVersionGreaterThanOrEqual('1.1.0', '1.0.0')).toBe(true);
      expect(isSemanticVersionGreaterThanOrEqual('1.10.0', '1.9.0')).toBe(true);
    });

    it('should return false when major is equal and minor is less', () => {
      expect(isSemanticVersionGreaterThanOrEqual('1.0.0', '1.1.0')).toBe(false);
      expect(isSemanticVersionGreaterThanOrEqual('1.0.9', '1.1.0')).toBe(false);
    });
  });

  describe('patch version comparison', () => {
    it('should return true when major and minor are equal and patch is greater', () => {
      expect(isSemanticVersionGreaterThanOrEqual('1.0.1', '1.0.0')).toBe(true);
      expect(isSemanticVersionGreaterThanOrEqual('1.0.10', '1.0.9')).toBe(true);
    });

    it('should return true when major and minor are equal and patch is equal', () => {
      expect(isSemanticVersionGreaterThanOrEqual('1.0.5', '1.0.5')).toBe(true);
    });

    it('should return false when major and minor are equal and patch is less', () => {
      expect(isSemanticVersionGreaterThanOrEqual('1.0.0', '1.0.1')).toBe(false);
      expect(isSemanticVersionGreaterThanOrEqual('1.0.9', '1.0.10')).toBe(false);
    });
  });
});
