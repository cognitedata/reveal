/*!
 * Copyright 2025 Cognite AS
 */
import { isDmIdentifier } from './typeGuards';

describe(isDmIdentifier.name, () => {
  test('recognizes DM identifier', () => {
    expect(isDmIdentifier({ externalId: 'external-id', space: 'space' })).toBeTruthy();
  });

  test('does not recognize classic asset internal ID', () => {
    expect(isDmIdentifier({ id: 123 })).toBeFalsy();
  });

  test('does not recognize classic asset external ID', () => {
    expect(isDmIdentifier({ externalId: 'classic-external-id' })).toBeFalsy();
  });

  test('does not recognize null', () => {
    expect(isDmIdentifier(null)).toBeFalsy();
  });

  test('does not recognize undefined', () => {
    expect(isDmIdentifier(undefined)).toBeFalsy();
  });

  test('does not recognize numbers', () => {
    expect(isDmIdentifier(123)).toBeFalsy();
  });

  test('does not recognize empty objects', () => {
    expect(isDmIdentifier({})).toBeFalsy();
  });
});
