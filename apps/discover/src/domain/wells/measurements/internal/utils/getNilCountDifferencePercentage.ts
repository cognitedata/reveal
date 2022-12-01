import isNil from 'lodash/isNil';
import { Fixed, toFixedNumberFromNumber } from 'utils/number';

import { MeasurementCurveData } from '../types';

export const getNilCountDifferencePercentage = (
  curve1: MeasurementCurveData,
  curve2: MeasurementCurveData
) => {
  const curve1X = curve1.x as (number | null)[] | undefined;
  const curve2X = curve2.x as (number | null)[] | undefined;

  if (!curve1X || !curve2X) {
    return 100;
  }

  const curve1NilValues = curve1X.filter(isNil);
  const curve2NilValues = curve2X.filter(isNil);

  const nilCountDifference = Math.abs(
    curve1NilValues.length - curve2NilValues.length
  );

  const totalValues = (curve1X.length + curve2X.length) / 2;

  const percentage = (nilCountDifference / totalValues) * 100;

  return toFixedNumberFromNumber(percentage, Fixed.ThreeDecimals);
};
