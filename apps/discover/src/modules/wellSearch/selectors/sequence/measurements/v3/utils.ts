import flatten from 'lodash/flatten';
import sortBy from 'lodash/sortBy';
import uniqBy from 'lodash/uniqBy';

import { DepthMeasurementColumn } from '@cognite/sdk-wells-v3';

import { MEASUREMENT_EXTERNAL_ID_CONFIG } from 'modules/wellSearch/constants';
import {
  WellboreMeasurementsMapV3 as WellboreMeasurementsMap,
  MeasurementTypeV3 as MeasurementType,
  WdlMeasurementType,
} from 'modules/wellSearch/types';

export const getSortedUniqCurves = (
  data: WellboreMeasurementsMap
): DepthMeasurementColumn[] => {
  const measurements = flatten(Object.values(data));
  const allColumns = measurements.flatMap((measurement) => measurement.columns);
  const uniqueColumns = uniqBy(allColumns, (column) => column.measurementType);
  return sortBy(uniqueColumns, 'measurementType');
};

export const filterCurvesByMeasurementTypes = (
  measurementTypes: Array<MeasurementType>,
  curves: Array<DepthMeasurementColumn>
) =>
  curves.filter((column) =>
    Object.values(
      flatten(
        measurementTypes.map(
          (measurementType) => MEASUREMENT_EXTERNAL_ID_CONFIG[measurementType]
        )
      )
    ).find((type) => {
      return type === (column.measurementType as WdlMeasurementType);
    })
  );

export const getUniqCurvesOfMeasurementType = (
  measurementTypes: Array<MeasurementType>,
  data?: WellboreMeasurementsMap
) => {
  if (!data) return [] as DepthMeasurementColumn[];
  return filterCurvesByMeasurementTypes(
    measurementTypes,
    getSortedUniqCurves(data)
  );
};

export const getUniqGeomechanicsCurves = (data?: WellboreMeasurementsMap) =>
  getUniqCurvesOfMeasurementType([MeasurementType.GEOMECHANNICS], data);

export const getUniqPpfgCurves = (data?: WellboreMeasurementsMap) =>
  getUniqCurvesOfMeasurementType([MeasurementType.PPFG], data);

export const getUniqOtherCurves = (data?: WellboreMeasurementsMap) =>
  getUniqCurvesOfMeasurementType(
    [MeasurementType.FIT, MeasurementType.LOT],
    data
  );
