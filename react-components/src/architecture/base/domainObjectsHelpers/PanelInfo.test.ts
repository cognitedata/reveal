import { describe, expect, test } from 'vitest';
import { NumberPanelItem } from './PanelInfo';
import { Quantity } from './Quantity';
import { UnitSystem } from '../renderTarget/UnitSystem';

describe(NumberPanelItem.name, () => {
  test('should translate the test', () => {
    const item = new NumberPanelItem({
      value: 0,
      quantity: Quantity.Length,
      translationInput: { key: 'RADIUS' }
    });

    expect(item.getText()).toBe('Radius');
  });

  test('should set value at NumberPanelItem', () => {
    let originalValue = 10;
    function setValue(value: number): void {
      originalValue = value;
    }
    function verifyValue(value: number): boolean {
      return value >= 10;
    }
    const item = new NumberPanelItem({
      value: originalValue,
      quantity: Quantity.Length,
      translationInput: { key: 'RADIUS' },
      setValue,
      verifyValue
    });
    const unitSystem = new UnitSystem();
    expect(item.trySetValue(11, unitSystem)).toBe(true);
    expect(item.trySetValue(9, unitSystem)).toBe(false);
    expect(item.trySetValue(Number.NaN, unitSystem)).toBe(false);

    expect(originalValue).toBe(11); // Still 11, not changed by the 9 and NaN
  });

  test('should set value at NumberPanelItem without verifyValue', () => {
    let originalValue = 10;
    function setValue(value: number): void {
      originalValue = value;
    }
    const item = new NumberPanelItem({
      value: originalValue,
      quantity: Quantity.Length,
      translationInput: { key: 'RADIUS' },
      setValue
    });
    const unitSystem = new UnitSystem();
    expect(item.trySetValue(9, unitSystem)).toBe(true);
    expect(item.trySetValue(Number.NaN, unitSystem)).toBe(false);
    expect(originalValue).toBe(9); // Still 9, not changed by the NaN
  });

  test('should not set value at NumberPanelItem without setValue and verifyValue', () => {
    const item = new NumberPanelItem({
      value: 0,
      quantity: Quantity.Length,
      translationInput: { key: 'RADIUS' }
    });
    const unitSystem = new UnitSystem();

    // Always fails
    expect(item.trySetValue(9, unitSystem)).toBe(false);
    expect(item.trySetValue(Number.NaN, unitSystem)).toBe(false);
  });
});
