import { describe, expect, test } from 'vitest';
import { NumberPanelItem } from './PanelInfo';
import { Quantity } from './Quantity';
import { UnitSystem } from '../renderTarget/UnitSystem';

describe(NumberPanelItem.name, () => {
  const unitSystem = new UnitSystem();
  let originalValue = 0;
  function setValueMock(value: number): void {
    originalValue = value;
  }
  function verifyValueMock(value: number): boolean {
    return value >= 10;
  }

  test('should translate the text', () => {
    const item = new NumberPanelItem({
      value: 0,
      quantity: Quantity.Length,
      translationInput: { key: 'RADIUS' }
    });
    expect(item.getText()).toBe('Radius');
  });

  test('should set value', () => {
    const item = new NumberPanelItem({
      value: 0,
      quantity: Quantity.Length,
      translationInput: { key: 'RADIUS' },
      setValue: setValueMock,
      verifyValue: verifyValueMock
    });
    expect(item.trySetValue(42, unitSystem)).toBe(true);
    expect(item.trySetValue(9, unitSystem)).toBe(false);
    expect(item.trySetValue(Number.NaN, unitSystem)).toBe(false);

    expect(originalValue).toBe(42); // Still 42, not changed by the 9 and NaN
  });

  test('should set value without verifyValue', () => {
    const item = new NumberPanelItem({
      value: 0,
      quantity: Quantity.Length,
      translationInput: { key: 'RADIUS' },
      setValue: setValueMock
    });
    expect(item.trySetValue(42, unitSystem)).toBe(true);
    expect(item.trySetValue(Number.NaN, unitSystem)).toBe(false);
    expect(originalValue).toBe(42); // Still 42, not changed by the NaN
  });

  test('should not set value without setValue and verifyValue', () => {
    const item = new NumberPanelItem({
      value: 0,
      quantity: Quantity.Length,
      translationInput: { key: 'RADIUS' }
    });
    // Always fails when setValue is missing
    expect(item.trySetValue(42, unitSystem)).toBe(false);
    expect(item.trySetValue(Number.NaN, unitSystem)).toBe(false);
  });
});
