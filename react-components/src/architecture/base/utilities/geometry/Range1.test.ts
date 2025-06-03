/*!
 * Copyright 2025 Cognite AS
 */

import { describe, expect, test } from 'vitest';

import { Range1 } from './Range1';

const min = 100;
const max = 200;
const mid = (min + max) / 2;
const delta = max - min;

describe(Range1.name, () => {
  test('should test empty', () => {
    const range = new Range1();
    expect(range.isEmpty).toBe(true);
    expect(range.isSingular).toBe(true);
    expect(range.hasSpan).toBe(false);

    range.set(min, max);
    expect(range.isEmpty).toBe(false);

    range.makeEmpty();
    expect(range.isEmpty).toBe(true);
  });

  test('should test non empty', () => {
    const range = new Range1(min, max);
    expect(range.isEmpty).toBe(false);
    expect(range.isSingular).toBe(false);
    expect(range.hasSpan).toBe(true);

    expect(range.min).toBe(min);
    expect(range.max).toBe(max);
    expect(range.delta).toBe(delta);
    expect(range.center).toBe(mid);
  });

  test('should test set', () => {
    const range = new Range1();
    range.set(min, max);
    expect(range.min).toBe(min);
    expect(range.max).toBe(max);
    expect(range.isEmpty).toBe(false);
  });

  test('should test equals', () => {
    const range = new Range1(min, max);
    expect(range.equals(new Range1(min, max))).toBe(true);
    expect(range.equals(new Range1(min, mid))).toBe(false);
    expect(range.equals(new Range1(mid, max))).toBe(false);
  });

  test('should test clone', () => {
    const range = new Range1(min, max);
    expect(range.equals(range.clone())).toBe(true);

    range.makeEmpty();
    expect(range.equals(range.clone())).toBe(true);
  });

  test('should test isInside', () => {
    const range = new Range1(min, max);
    expect(range.isInside(99)).toBe(false);
    expect(range.isInside(mid)).toBe(true);
    expect(range.isInside(201)).toBe(false);
  });

  test('should test getFraction', () => {
    const range = new Range1(min, max);
    expect(range.getFraction(min)).toBe(0);
    expect(range.getFraction(mid)).toBe(0.5);
    expect(range.getFraction(max)).toBe(1);
  });

  test('should test getTruncatedFraction', () => {
    const range = new Range1(min, max);
    expect(range.getTruncatedFraction(50)).toBe(0);
    expect(range.getTruncatedFraction(mid)).toBe(0.5);
    expect(range.getTruncatedFraction(250)).toBe(1);
  });

  test('should test getValue', () => {
    const range = new Range1(min, max);
    expect(range.getValue(0)).toBe(min);
    expect(range.getValue(0.5)).toBe(mid);
    expect(range.getValue(1)).toBe(max);
  });

  test('should test getBestIncrement', () => {
    const range = new Range1(min, max);
    expect(range.getBestIncrement(50)).toBe(2.5);
  });

  test('should test getNumTicks', () => {
    const range = new Range1(min, max);
    expect(range.getNumTicks(50)).toBe(2);
    expect(range.getNumTicks(25)).toBe(4);
  });

  test('should test getTicks', () => {
    const range = new Range1(min, max);
    expect(Array.from(range.getTicks(0))).toEqual([]);
    expect(Array.from(range.getTicks(25))).toEqual([100, 125, 150, 175, 200]);
    expect(Array.from(range.getTicks(50))).toEqual([100, 150, 200]);
    expect(Array.from(range.getTicks(200))).toEqual([200]);
    expect(Array.from(range.getTicks(500))).toEqual([]);
  });

  test('should test getFastTicks', () => {
    const range = new Range1(99.99, 200.01);
    const tolerance = 0.001;
    expect(Array.from(range.getFastTicks(0, tolerance))).toEqual([]);
    expect(Array.from(range.getFastTicks(25, tolerance))).toEqual([100, 125, 150, 175, 200]);
    expect(Array.from(range.getFastTicks(50, tolerance))).toEqual([100, 150, 200]);
    expect(Array.from(range.getFastTicks(200, tolerance))).toEqual([200]);
    expect(Array.from(range.getTicks(500))).toEqual([]);
  });

  test('should test getBoldIncrement', () => {
    const range = new Range1(min, max);
    expect(range.getBoldIncrement(1)).toEqual(2);
    expect(range.getBoldIncrement(1, 3)).toEqual(3);
  });

  test('should test translate', () => {
    const range = new Range1(min, max);
    range.translate(2);
    expect(range).toStrictEqual(new Range1(min + 2, max + 2));
  });

  test('should test scale', () => {
    const range = new Range1(min, max);
    range.scale(2);
    expect(range).toStrictEqual(new Range1(min * 2, max * 2));
  });

  test('should test scaleDelta', () => {
    const range = new Range1(min, max);
    range.scaleDelta(2);
    expect(range).toStrictEqual(new Range1(50, 250));
  });

  test('should test add', () => {
    const range = new Range1();
    range.add(min);
    range.add(mid);
    range.add(max);
    expect(range).toStrictEqual(new Range1(min, max));
  });

  test('should test addRange', () => {
    const range = new Range1();
    range.addRange(new Range1(min, mid));
    range.addRange(new Range1(mid, max));
    expect(range).toStrictEqual(new Range1(min, max));
  });

  test('should test expandByMargin', () => {
    const range = new Range1(min, max);
    const margin = 5;
    range.expandByMargin(margin);
    expect(range).toStrictEqual(new Range1(min - margin, max + margin));

    range.set(min, max);
    range.expandByMargin(-margin);
    expect(range).toStrictEqual(new Range1(min + margin, max - margin));
  });

  test('should test expandByFraction', () => {
    const range = new Range1(min, max);
    range.expandByFraction(0.05);
    expect(range).toStrictEqual(new Range1(95, 205));
  });

  test('should test roundByInc', () => {
    const range = new Range1(min + 2, max - 2);
    expect(range.roundByInc(5)).toBe(true);
    expect(range).toStrictEqual(new Range1(min, max));

    range.set(min - 2, max + 2);
    expect(range.roundByInc(5)).toBe(true);
    expect(range).toStrictEqual(new Range1(95, 205));

    range.set(min - 2, max + 2);
    expect(range.roundByInc(-5)).toBe(true);
    expect(range).toStrictEqual(new Range1(min, max));
  });

  test('should test various operation with empty', () => {
    const range = new Range1();
    expect(range.isEmpty).toBe(true);
    range.translate(200);
    expect(range.isEmpty).toBe(true);
    range.scale(200);
    expect(range.isEmpty).toBe(true);
    range.scaleDelta(200);
    expect(range.isEmpty).toBe(true);
    range.expandByMargin(1);
    expect(range.isEmpty).toBe(true);
    range.expandByFraction(1);
    expect(range.isEmpty).toBe(true);
    range.roundByInc(1);
    expect(range.isEmpty).toBe(true);
  });
});
