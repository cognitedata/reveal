const DEFAULT_INVALID_VALUE = -9999;
const INVALID_VALUES = [0, DEFAULT_INVALID_VALUE];

/**
 * This condition checks if an invalid value is detected in the curve coordinates.
 *
 * `0` as the first value -> valid
 * `-9999` as the first value -> invalid
 * `0` or `-9999` in the middle of the values -> invalid
 *
 * Returns true if valid, false if invalid.
 */
export const isValidDepthMeasurement = ({
  depthValue,
  columnValue,
  rowIndex,
}: {
  depthValue: number;
  columnValue: number;
  rowIndex: number;
}) => {
  if (rowIndex === 0) {
    if (
      depthValue === DEFAULT_INVALID_VALUE ||
      columnValue === DEFAULT_INVALID_VALUE
    ) {
      return false;
    }
    return true;
  }

  if (
    INVALID_VALUES.includes(depthValue) ||
    INVALID_VALUES.includes(columnValue)
  ) {
    return false;
  }
  return true;
};
