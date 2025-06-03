/*!
 * Copyright 2024 Cognite AS
 */

import { describe, expect, test } from 'vitest';
import { getResizeCursor } from './getResizeCursor';

describe(getResizeCursor.name, () => {
  test('should get the correct cursor', () => {
    expect(getResizeCursor(0)).toBe('ew-resize');
    expect(getResizeCursor(1)).toBe('nesw-resize');
    expect(getResizeCursor(2)).toBe('ns-resize');
    expect(getResizeCursor(3)).toBe('nwse-resize');
    expect(getResizeCursor(4)).toBe('ew-resize');
    expect(getResizeCursor(5)).toBe('nesw-resize');
    expect(getResizeCursor(6)).toBe('ns-resize');
    expect(getResizeCursor(7)).toBe('nwse-resize');
    expect(getResizeCursor(8)).toBeUndefined();
  });
});
