import { conversions } from '../data/conversions';

export const convertValue = (
  value: number,
  inputUnit: string = '',
  outputUnit: string = ''
) => {
  const conversionFormula = (conversions[inputUnit] || {})[outputUnit];
  return conversionFormula ? conversionFormula(value) : value;
};
