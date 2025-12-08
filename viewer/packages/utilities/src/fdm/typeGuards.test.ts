/*!
 * Copyright 2025 Cognite AS
 */
import { isDmIdentifier } from './typeGuards';

describe(isDmIdentifier.name, () => {
  test('recognizes DM identifier', () => {
    expect(isDmIdentifier({ externalId: 'external-id', space: 'space' })).toBeTrue();
  });

  test('does not recognize classic asset ID', () => {
    expect(isDmIdentifier({ id: 123 })).toBeFalse();
  });

  test('does not recognize null', () => {
    expect(isDmIdentifier(null)).toBeFalse();
  });

  test('does not recognize undefined', () => {
    expect(isDmIdentifier(undefined)).toBeFalse();
  });

  test('does not recognize numbers', () => {
    expect(isDmIdentifier(123)).toBeFalse();
  });

  test('does not recognize empty objects', () => {
    expect(isDmIdentifier({})).toBeFalse();
  });
});
