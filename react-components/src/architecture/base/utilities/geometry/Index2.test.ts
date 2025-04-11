/*!
 * Copyright 2025 Cognite AS
 */

import { describe, expect, test } from 'vitest';

import { Index2 } from './Index2';

describe(Index2.name, () => {
  test('should clone', () => {
    const index = new Index2(2, 3);
    expect(index).toStrictEqual(index.clone());
  });

  test('should get size', () => {
    const index = new Index2(2, 3);
    expect(index.size).toStrictEqual(6);
  });

  test('should be zero', () => {
    const index = new Index2(0, 0);
    expect(index.isZero).toStrictEqual(true);
  });

  test('should be not be zero', () => {
    const index = new Index2(2, 3);
    expect(index.isZero).toStrictEqual(false);
  });

  test('should get component', () => {
    const index = new Index2(2, 3);
    expect(index.getComponent(0)).toStrictEqual(2);
    expect(index.getComponent(1)).toStrictEqual(3);
    expect(index.getComponent(2)).toBeNaN();
  });

  test('should get string', () => {
    const index = new Index2(2, 3);
    expect(index.toString()).toBe('(2, 3)');
  });

  test('should copyFrom', () => {
    const actual = new Index2(2, 3);
    const expected = new Index2(0, 0);
    expect(expected.isZero).toStrictEqual(true);
    const returnValue = expected.copyFrom(actual);
    expect(returnValue).toBe(expected);
    expect(expected.isZero).toStrictEqual(false);
    expect(actual).toStrictEqual(expected);
  });

  test('should add', () => {
    const index = new Index2(5, 8);
    const returnValue = index.add(new Index2(2, 3));
    expect(returnValue).toBe(index);
    expect(index).toStrictEqual(new Index2(7, 11));
  });

  test('should subtract', () => {
    const index = new Index2(6, 8);
    const returnValue = index.subtract(new Index2(2, 3));
    expect(returnValue).toBe(index);
    expect(index).toStrictEqual(new Index2(4, 5));
  });
});
