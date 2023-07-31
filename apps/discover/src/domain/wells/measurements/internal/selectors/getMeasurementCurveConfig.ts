import { MEASUREMENT_CURVE_CONFIG } from '../config/measurementCurveConfig';
import { DepthMeasurementDataColumnInternal } from '../types';

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
