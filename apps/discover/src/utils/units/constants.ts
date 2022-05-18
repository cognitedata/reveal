import convert, { Distance } from 'convert-units';

export const OTHER_CONVERSION_UNITS = {
  ftUS: 'ft-us',
  meter: 'm',
  feet: 'ft',
  foot: 'ft',
  inch: 'in',
  yard: 'm',
} as const;

export type OtherConversionUnit = keyof typeof OTHER_CONVERSION_UNITS;
export type OtherConversionUnitValue =
  typeof OTHER_CONVERSION_UNITS[OtherConversionUnit];

export const UNITS_TO_STANDARD = OTHER_CONVERSION_UNITS as Record<
  OtherConversionUnit,
  convert.Unit
>;

export interface ConvertedDistance {
  value: number;
  unit: Distance;
}
