/*!
 * Copyright 2024 Cognite AS
 */

import { isEmpty } from 'lodash';
import { Quantity } from '../domainObjectsHelpers/Quantity';

const METER_TO_FT = 1 / 0.3048;

/**
 * Represents a unit system that handles conversions and formatting of values based on the system's metric setting.
 * This is a very basic unit system, but could be extended in the future to cover all use cases.
 * Todo: Should use CogniteClient.units to get the unit and conversion factors
 */
export class UnitSystem {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public isMetric: boolean = true;

  // ==================================================
  // INSTANCE METHODS: Convert number
  // ==================================================

  public convertToUnit(value: number, quantity: Quantity): number {
    if (!this.isMetric) {
      switch (quantity) {
        case Quantity.Length:
          return value * METER_TO_FT;
        case Quantity.Area:
          return value * METER_TO_FT * METER_TO_FT;
        case Quantity.Volume:
          return value * METER_TO_FT * METER_TO_FT * METER_TO_FT;
      }
    }
    return value;
  }

  public convertFromUnit(value: number, quantity: Quantity): number {
    if (!this.isMetric) {
      switch (quantity) {
        case Quantity.Length:
          return value / METER_TO_FT;
        case Quantity.Area:
          return value / (METER_TO_FT * METER_TO_FT);
        case Quantity.Volume:
          return value / (METER_TO_FT * METER_TO_FT * METER_TO_FT);
      }
    }
    return value;
  }

  // ==================================================
  // INSTANCE METHODS: Convert number to string
  // ==================================================

  public toString(value: number, quantity: Quantity): string {
    const fractionDigits = this.getFractionDigits(quantity);
    const convertedValue = this.convertToUnit(value, quantity);
    return convertedValue.toFixed(fractionDigits);
  }

  public toStringWithUnit(value: number, quantity: Quantity): string {
    const text = this.toString(value, quantity);
    const unit = this.getUnit(quantity);
    if (isEmpty(unit)) {
      return text;
    }
    return `${text} ${unit}`;
  }

  // ==================================================
  // INSTANCE METHODS: Getters
  // ==================================================

  public getUnit(quantity: Quantity): string {
    switch (quantity) {
      case Quantity.Unitless:
        return '';
      case Quantity.Length:
        return this.isMetric ? 'm' : 'ft';
      case Quantity.Area:
        return this.isMetric ? 'm²' : 'ft²';
      case Quantity.Volume:
        return this.isMetric ? 'm³' : 'ft³';
      case Quantity.Angle:
        return '°';
    }
  }

  private getFractionDigits(quantity: Quantity): number {
    switch (quantity) {
      case Quantity.Angle:
        return 1;
      default:
        return 2;
    }
  }
}
