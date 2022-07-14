import { DepthMeasurementInternal } from '../types';

export const getEmptyDepthMeasurementData = (
  depthMeasurement: DepthMeasurementInternal
) => {
  const { source, depthColumn } = depthMeasurement;

  return {
    id: 0,
    source,
    depthColumn,
    depthUnit: depthColumn.unit,
    columns: [],
    rows: [],
  };
};
