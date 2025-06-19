import { isEmpty } from 'lodash';
import { Quantity } from '../domainObjectsHelpers/Quantity';

const METER_TO_FT = 1 / 0.3048;
const METER_TO_INCH = 12 * METER_TO_FT;

export enum LengthUnit {
  Meter = 'Meter',
  Feet = 'Feet',
  Inch = 'Inch'
}

/**
 * Represents a unit system that handles conversions and formatting of values.
 * This is a very basic unit system, but could be extended in the future to cover all use cases.
 */

export class UnitSystem {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public lengthUnit: LengthUnit = LengthUnit.Meter;

  // ==================================================
  // INSTANCE METHODS: Convert number
  // ==================================================

  public convertToUnit(value: number, quantity: Quantity): number {
    const factor = this.getConversionFactorForLengthUnit();
    return convert(value, factor, quantity);
  }

  public convertFromUnit(value: number, quantity: Quantity): number {
    const factor = this.getConversionFactorForLengthUnit();
    return convert(value, 1 / factor, quantity);
  }

  // ==================================================
  // INSTANCE METHODS: Convert number to string
  // ==================================================

  public toString(value: number, quantity: Quantity): string {
    const fractionDigits = this.getFractionDigits(quantity);
    const convertedValue = this.convertToUnit(value, quantity);

    // This ensures the number with commas as thousands separators
    return convertedValue.toLocaleString('default', {
      maximumFractionDigits: fractionDigits,
      minimumFractionDigits: fractionDigits
    });
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
        return this.getTextForLengthUnit();
      case Quantity.Area:
        return this.getTextForLengthUnit() + '²';
      case Quantity.Volume:
        return this.getTextForLengthUnit() + '³';
      case Quantity.Angle:
        return '°';
    }
  }

  private getFractionDigits(quantity: Quantity): number {
    switch (quantity) {
      case Quantity.Angle:
        return 1;

      case Quantity.Length:
      case Quantity.Area:
      case Quantity.Volume:
        return this.getFractionDigitsForLengthUnits();

      default:
        return 2;
    }
  }

  private getConversionFactorForLengthUnit(): number {
    switch (this.lengthUnit) {
      case LengthUnit.Feet:
        return METER_TO_FT;
      case LengthUnit.Inch:
        return METER_TO_INCH;
      default:
        return 1;
    }
  }

  private getTextForLengthUnit(): string {
    switch (this.lengthUnit) {
      case LengthUnit.Feet:
        return 'ft';
      case LengthUnit.Inch:
        return 'in';
      default:
        return 'm';
    }
  }

  private getFractionDigitsForLengthUnits(): number {
    switch (this.lengthUnit) {
      case LengthUnit.Inch:
        return 1;
      case LengthUnit.Feet:
        return 2;
      default:
        return 3;
    }
  }

  public static getFullTextForLengthUnit(lengthUnit: LengthUnit): string {
    switch (lengthUnit) {
      case LengthUnit.Feet:
        return 'Feet';
      case LengthUnit.Inch:
        return 'Inches';
      default:
        return 'Meters';
    }
  }
}

function convert(value: number, factor: number, quantity: Quantity): number {
  if (factor === 1) {
    return value; // No conversion needed
  }
  switch (quantity) {
    case Quantity.Length:
      return value * factor;
    case Quantity.Area:
      return value * factor * factor;
    case Quantity.Volume:
      return value * factor * factor * factor;
    default:
      return value;
  }
}
