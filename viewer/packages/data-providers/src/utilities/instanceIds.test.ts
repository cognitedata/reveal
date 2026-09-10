/*!
 * Copyright 2026 Cognite AS
 */
import { dmInstanceRefToKey } from '@reveal/utilities';
import { getInstanceKey } from './instanceIds';

describe(getInstanceKey.name, () => {
  test('transforms DM identifiers correctly', () => {
    const id = { externalId: 'externalId-0', space: 'space-0' };
    expect(getInstanceKey(id)).toBe(dmInstanceRefToKey(id));
  });

  test('transforms classic internal ID correctly', () => {
    const id = { id: 123 };
    expect(getInstanceKey(id)).toBe('123');
  });

  test('transforms classic external ID correctly', () => {
    const id = { externalId: 'id-0' };
    expect(getInstanceKey(id)).toBe('id-0');
  });
});
