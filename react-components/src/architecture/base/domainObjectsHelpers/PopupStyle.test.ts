/*!
 * Copyright 2024 Cognite AS
 */

import { describe, expect, test } from 'vitest';
import { PopupStyle } from './PopupStyle';

describe('PopupStyle', () => {
  test('should create a PopupStyle with default values', () => {
    const style = new PopupStyle({});
    expect(style.leftPx).toBe('undefined');
    expect(style.topPx).toBe('undefined');
    expect(style.rightPx).toBe('undefined');
    expect(style.bottomPx).toBe('undefined');
    expect(style.marginPx).toBe('8px');
    expect(style.paddingPx).toBe('6px');
    expect(style.isHorizontal).toBe(true);
    expect(style.isHorizontalDivider).toBe(false);
    expect(style.flexFlow).toBe('row');
  });

  test('should create a PopupStyle with values', () => {
    const style = new PopupStyle({
      left: 1,
      top: 2,
      right: 3,
      bottom: 4,
      padding: 5,
      margin: 6,
      horizontal: false
    });
    expect(style.leftPx).toBe('1px');
    expect(style.topPx).toBe('2px');
    expect(style.rightPx).toBe('3px');
    expect(style.bottomPx).toBe('4px');
    expect(style.marginPx).toBe('6px');
    expect(style.paddingPx).toBe('5px');

    expect(style.isHorizontal).toBe(false);
    expect(style.isHorizontalDivider).toBe(true);
    expect(style.flexFlow).toBe('column');
  });
});
