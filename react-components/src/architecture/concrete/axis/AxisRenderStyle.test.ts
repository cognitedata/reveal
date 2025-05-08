/*!
 * Copyright 2024 Cognite AS
 */

import { describe, expect, test } from 'vitest';
import { AxisRenderStyle } from './AxisRenderStyle';

describe(AxisRenderStyle.name, () => {
  test('should clone', () => {
    const style = new AxisRenderStyle();
    const clone = style.clone();
    expect(clone).toStrictEqual(style);
  });

  test('should get correct axis color', () => {
    const style = new AxisRenderStyle();
    expect(style.getAxisColor(false, 1)).toStrictEqual(style.mainAxisColor);
    expect(style.getAxisColor(true, 0)).toStrictEqual(style.xAxisColor);
    expect(style.getAxisColor(true, 1)).toStrictEqual(style.yAxisColor);
    expect(style.getAxisColor(true, 2)).toStrictEqual(style.zAxisColor);
  });

  test('should get correct axis label', () => {
    const style = new AxisRenderStyle();
    expect(style.getAxisLabel(0)).toBe('X');
    expect(style.getAxisLabel(1)).toBe('Y');
    expect(style.getAxisLabel(2)).toBe('Z');
  });
});
