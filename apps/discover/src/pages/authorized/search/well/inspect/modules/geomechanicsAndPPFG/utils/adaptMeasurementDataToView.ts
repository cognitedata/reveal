import { DepthMeasurementWithData } from 'domain/wells/measurements/internal/types';
import { WdlMeasurementType } from 'domain/wells/measurements/service/types';
import { WellboreInternal } from 'domain/wells/wellbore/internal/types';

import keyBy from 'lodash/keyBy';

import { MeasurementsView } from '../types';

import { getMeasurementTypeMap } from './getMeasurementTypeMap';

const ANGLE_CURVES_UNIT = 'deg';

export const adaptMeasurementDataToView = (
  wellbores: WellboreInternal[],
  depthMeasurementWithData: DepthMeasurementWithData[]
): MeasurementsView[] => {
  const measurementTypeMap = getMeasurementTypeMap();
  const keyedWellbores = keyBy(wellbores, 'matchingId');

  return depthMeasurementWithData.map((data) => {
    const { wellboreMatchingId } = data;
    const wellbore = keyedWellbores[wellboreMatchingId];

    return {
      ...data,
      wellName: wellbore.wellName || 'Unknown',
      wellboreName: wellbore.name,
      wellboreColor: wellbore.color,
      columns: data.columns.map((column) => {
        const measurementTypeParent =
          measurementTypeMap[column.measurementType as WdlMeasurementType];

        return {
          ...column,
          measurementTypeParent,
          isAngle: column.unit === ANGLE_CURVES_UNIT,
        };
      }),
    };
  });
};
