import { AxisDirection } from '../types';

export const getFixedRangeConfig = (
  axisDirection: AxisDirection | undefined,
  axis: 'x' | 'y'
): boolean => {
  if (axisDirection?.includes(axis)) {
    return false;
  }

  return true;
};
