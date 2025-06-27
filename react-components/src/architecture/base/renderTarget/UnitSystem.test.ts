import { describe, expect, test } from 'vitest';

import { Quantity } from '../domainObjectsHelpers/Quantity';
import { LengthUnit, UnitSystem } from './UnitSystem';

describe(UnitSystem.name, () => {
  test('Should convert to and from non metric unit system', () => {
    const quantities = [Quantity.Length, Quantity.Area, Quantity.Volume];
    const lengthUnits = [LengthUnit.Feet, LengthUnit.Inch];

    const unitSystem = new UnitSystem();

    for (const lengthUnit of lengthUnits) {
      unitSystem.lengthUnit = lengthUnit;
      for (const quantity of quantities) {
        const value = 1;
        const converted = unitSystem.convertToUnit(value, quantity);
        expect(converted).not.toBeCloseTo(value);

        const convertedBack = unitSystem.convertFromUnit(converted, quantity);
        expect(convertedBack).not.toBeCloseTo(converted);

        expect(convertedBack).toBeCloseTo(value);
      }
    }
  });

  test('Should convert to and from metric unit system', () => {
    const unitSystem = new UnitSystem();

    for (const quantity of [Quantity.Length, Quantity.Area, Quantity.Volume]) {
      const value = 1;
      const converted = unitSystem.convertToUnit(value, quantity);
      expect(converted).toBeCloseTo(value);

      const convertedBack = unitSystem.convertFromUnit(converted, quantity);
      expect(convertedBack).toBeCloseTo(converted);
      expect(convertedBack).toBeCloseTo(value);
    }
  });

  test('Should get length, area and volume as string in default units', () => {
    const unitSystem = new UnitSystem();
    const value = 31415;
    expect(unitSystem.toStringWithUnit(value, Quantity.Length)).toBe('31,415.000 m');
    expect(unitSystem.toStringWithUnit(value, Quantity.Area)).toBe('31,415.000 m²');
    expect(unitSystem.toStringWithUnit(value, Quantity.Volume)).toBe('31,415.000 m³');
  });

  test('Should get length, area and volume as string in ft', () => {
    const unitSystem = new UnitSystem();
    unitSystem.lengthUnit = LengthUnit.Feet;
    expect(unitSystem.toStringWithUnit(1, Quantity.Length)).toBe('3.28 ft');
    expect(unitSystem.toStringWithUnit(1, Quantity.Area)).toBe('10.76 ft²');
    expect(unitSystem.toStringWithUnit(1, Quantity.Volume)).toBe('35.31 ft³');
  });

  test('Should get length, area and volume as string in inch', () => {
    const unitSystem = new UnitSystem();
    unitSystem.lengthUnit = LengthUnit.Inch;
    expect(unitSystem.toStringWithUnit(1, Quantity.Length)).toBe('39.4 in');
    expect(unitSystem.toStringWithUnit(1, Quantity.Area)).toBe('1,550.0 in²');
    expect(unitSystem.toStringWithUnit(1, Quantity.Volume)).toBe('61,023.7 in³');
  });

  test('Should get angle and unit less as string', () => {
    const unitSystem = new UnitSystem();
    expect(unitSystem.toStringWithUnit(1, Quantity.Angle)).toBe('1.0 °');
    expect(unitSystem.toStringWithUnit(1, Quantity.Unitless)).toBe('1.00');
  });
});
