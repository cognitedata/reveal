import { describe, expect, test } from '@jest/globals';

import { calcDuration } from './time';

describe('calcDuration', () => {
  test('returns only ms if duration is less than a second', () => {
    const { h, m, s, ms } = calcDuration(500);
    expect(h).toBe(0);
    expect(m).toBe(0);
    expect(s).toBe(0);
    expect(ms).toBe(500);
  });

  test('returns s and ms if duration is less than a minute', () => {
    const { h, m, s, ms } = calcDuration(1200);
    expect(h).toBe(0);
    expect(m).toBe(0);
    expect(s).toBe(1);
    expect(ms).toBe(200);
  });

  test('returns m, s and ms if duration is less than an hour', () => {
    const { h, m, s, ms } = calcDuration(65123);
    expect(h).toBe(0);
    expect(m).toBe(1);
    expect(s).toBe(5);
    expect(ms).toBe(123);
  });

  test('returns hm m, s and ms if duration is more than an hour', () => {
    const { h, m, s, ms } = calcDuration(3725123);
    expect(h).toBe(1);
    expect(m).toBe(2);
    expect(s).toBe(5);
    expect(ms).toBe(123);
  });
});
