import { AxisDirection, AxisIdentifier } from '../types';

export const getBooleanFromAxisDirection = (
  direction: AxisDirection | false,
  axis: AxisIdentifier
) => {
  return direction && direction.includes(axis);
};
