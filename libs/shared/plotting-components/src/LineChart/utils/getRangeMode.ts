import { AxisIdentifier, Data } from '../types';
import { getDataAsArray } from './getDataAsArray';

export const getRangeMode = (data: Data | Data[], axis: AxisIdentifier) => {
  const hasNegativeValues = getDataAsArray(data).some((curve) =>
    curve[axis].some((value) => Number(value) < 0)
  );

  if (hasNegativeValues) {
    return 'normal';
  }

  return 'tozero';
};
