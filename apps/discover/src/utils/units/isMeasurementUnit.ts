import convert, { Unit } from 'convert-units';

/**
 *
 * @param unit The unit to check if a measurement unit.
 * @returns true if a measurement unit, false otherwise.
 */
export const isMeasurementUnit = (unit: string): boolean => {
  try {
    convert(0)
      .from(unit as Unit)
      .to('m'); // Trying to convert to meters.
    return true;
  } catch (e) {
    return false;
  }
};
