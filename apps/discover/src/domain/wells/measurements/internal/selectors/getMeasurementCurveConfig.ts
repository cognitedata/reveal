import { MEASUREMENT_CURVE_CONFIG } from '../config/measurementCurveConfig';
import { DepthMeasurementDataColumnInternal } from '../types';
import { isMeasurementTypeFitOrLot } from '../utils/isMeasurementTypeFitOrLot';

export const getMeasurementCurveConfig = (
  column: DepthMeasurementDataColumnInternal
) => {
  const { measurementTypeParent, externalId } = column;

  if (!measurementTypeParent) {
    return null;
  }

  const curveConfigCategory = MEASUREMENT_CURVE_CONFIG[measurementTypeParent];

  return curveConfigCategory[externalId] || curveConfigCategory.default;
};

export const hasMeasurementCurveConfig = (
  column: DepthMeasurementDataColumnInternal
) => {
  const { measurementTypeParent, externalId } = column;

  if (!measurementTypeParent) {
    return false;
  }

  // Since FIT and LOT curves have default curve config only.
  if (isMeasurementTypeFitOrLot(measurementTypeParent)) {
    return true;
  }

  const curveConfigCategory = MEASUREMENT_CURVE_CONFIG[measurementTypeParent];

  return Boolean(curveConfigCategory[externalId]);
};
