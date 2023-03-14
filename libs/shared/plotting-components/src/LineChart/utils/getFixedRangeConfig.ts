import { AxisDirection, AxisIdentifier } from '../types';

export const getFixedRangeConfig = (
  axisDirection: AxisDirection | undefined,
  axis: AxisIdentifier
): boolean => {
  if (axisDirection?.includes(axis)) {
    return false;
  }

  return true;
};
