import { describe, expect, test } from 'vitest';
import { CircleMarkerRenderStyle } from './CircleMarkerRenderStyle';

describe(CircleMarkerRenderStyle.name, () => {
  test('should clone', () => {
    const style = new CircleMarkerRenderStyle();
    const clone = style.clone();
    expect(clone).toStrictEqual(style);
  });
});
