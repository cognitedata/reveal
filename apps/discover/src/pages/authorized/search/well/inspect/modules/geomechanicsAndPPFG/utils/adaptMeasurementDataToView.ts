import { DepthMeasurementWithData } from 'domain/wells/measurements/internal/types';
import { WellboreInternal } from 'domain/wells/wellbore/internal/types';

import keyBy from 'lodash/keyBy';

import { MeasurementsView } from '../types';

export const adaptMeasurementDataToView = (
  wellbores: WellboreInternal[],
  depthMeasurementWithData: DepthMeasurementWithData[]
): MeasurementsView[] => {
  const keyedWellbores = keyBy(wellbores, 'matchingId');

  return depthMeasurementWithData.map((data) => {
    const { wellboreMatchingId } = data;
    const wellbore = keyedWellbores[wellboreMatchingId];

    return {
      ...data,
      wellName: wellbore.wellName || 'Unknown',
      wellboreName: wellbore.name,
      wellboreColor: wellbore.color,
    };
  });
};
