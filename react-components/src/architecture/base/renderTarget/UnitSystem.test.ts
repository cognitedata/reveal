/*!
 * Copyright 2025 Cognite AS
 */
import { beforeEach, describe, expect, test } from 'vitest';

import { Quantity } from '../domainObjectsHelpers/Quantity';
import { UnitSystem } from './UnitSystem';

describe(UnitSystem.name, () => {
  beforeEach(() => {});

  test('Should convert to and from non metric unit system', () => {
    const quantities = [Quantity.Length, Quantity.Area, Quantity.Volume];

    const unitSystem = new UnitSystem();
    unitSystem.isMetric = false;

    for (const quantity of quantities) {
      const value = 1;
      const converted = unitSystem.convertToUnit(value, quantity);
      expect(converted).not.toBeCloseTo(value);

      const convertedBack = unitSystem.convertFromUnit(converted, quantity);
      expect(convertedBack).not.toBeCloseTo(converted);

      expect(convertedBack).toBeCloseTo(value);
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

  test('Should get  length, area and volume as string in default units', () => {
    const unitSystem = new UnitSystem();
    expect(unitSystem.toStringWithUnit(1, Quantity.Length)).toBe('1.00 m');
    expect(unitSystem.toStringWithUnit(1, Quantity.Area)).toBe('1.00 m²');
    expect(unitSystem.toStringWithUnit(1, Quantity.Volume)).toBe('1.00 m³');
  });

  test('Should get length, area and volume as string in ft', () => {
    const unitSystem = new UnitSystem();
    unitSystem.isMetric = false;
    expect(unitSystem.toStringWithUnit(1, Quantity.Length)).toBe('3.28 ft');
    expect(unitSystem.toStringWithUnit(1, Quantity.Area)).toBe('10.76 ft²');
    expect(unitSystem.toStringWithUnit(1, Quantity.Volume)).toBe('35.31 ft³');
  });

  test('Should get andge and unit less as string', () => {
    const unitSystem = new UnitSystem();
    expect(unitSystem.toStringWithUnit(1, Quantity.Angle)).toBe('1.0 °');
    expect(unitSystem.toStringWithUnit(1, Quantity.Unitless)).toBe('1.00');
  });
});
