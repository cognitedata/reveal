import { CURVE_FILL_COLOR_OPACITY } from '../constants';
import { MeasurementCurveData, MeasurementTypeParent } from '../types';
import { getCurveFill } from '../utils/getCurveFill';
import { sortCurvesToFill } from '../utils/sortCurvesToFill';

export const getCurvesWithFillProps = (
  curves: MeasurementCurveData[]
): MeasurementCurveData[] => {
  const sortedCurves = sortCurvesToFill(curves);

  return sortedCurves.map((curve, index) => {
    const { line, measurementTypeParent } = curve;

    // We show uncetainty for PPFG curves only.
    if (measurementTypeParent !== MeasurementTypeParent.PPFG) {
      return curve;
    }

    return {
      ...curve,
      fill: getCurveFill(sortedCurves, index),
      fillcolor: line?.color
        ? `${line.color}${CURVE_FILL_COLOR_OPACITY}`
        : undefined,
    };
  });
};
