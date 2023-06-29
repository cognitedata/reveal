import { AxisRange } from '../types';

export const getUnifiedAxisRange = (
  axisRange1: AxisRange,
  axisRange2: AxisRange
): AxisRange => {
  const [min1, max1] = axisRange1;
  const [min2, max2] = axisRange2;

  return [Math.min(min1, min2), Math.max(max1, max2)];
};
