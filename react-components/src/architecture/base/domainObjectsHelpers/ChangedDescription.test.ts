/*!
 * Copyright 2024 Cognite AS
 */

import { describe, expect, test } from 'vitest';
import { ChangedDescription } from './ChangedDescription';
import { Changes } from './Changes';

describe(ChangedDescription.name, () => {
  test('should return true on change with fieldName', () => {
    const change = new ChangedDescription(Changes.renderStyle, 'radius');
    expect(change.isChanged('radius')).toBe(true);
    expect(change.isChanged('RADIUS')).toBe(true);
  });

  test('should return false on change with fieldName', () => {
    const change = new ChangedDescription(Changes.renderStyle);
    expect(change.isChanged('radius')).toBe(false);
  });
});
