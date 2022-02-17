import convert, { Unit } from 'convert-units';

/**
 * Checking if the units are convertible between each other.
 * If possible, return `toUnit`.
 * Otherwise, `fromUnit` is returned.
 */
export const getConvertibleUnit = (
  fromUnit: string,
  toUnit: string
): string => {
  try {
    convert(0)
      .from(fromUnit as Unit)
      .to(toUnit as Unit);
    return toUnit;
  } catch (e) {
    return fromUnit;
  }
};
