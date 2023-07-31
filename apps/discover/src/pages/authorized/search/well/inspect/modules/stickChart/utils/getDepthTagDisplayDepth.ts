import { Fixed, toFixedNumberFromNumber } from 'utils/number';

export const getDepthTagDisplayDepth = (depth: number) => {
  return toFixedNumberFromNumber(depth, Fixed.NoDecimals);
};
