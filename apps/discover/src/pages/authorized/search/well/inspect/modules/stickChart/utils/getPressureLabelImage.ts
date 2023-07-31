import { MeasurementTypeParent } from 'domain/wells/measurements/internal/types';

import FIT from '../WellboreStickChart/MeasurementsColumn/images/FIT.svg';
import LOT from '../WellboreStickChart/MeasurementsColumn/images/LOT.svg';

export const getPressureLabelImage = (
  measurementTypeParent: MeasurementTypeParent
) => {
  switch (measurementTypeParent) {
    case MeasurementTypeParent.FIT:
      return FIT;
    case MeasurementTypeParent.LOT:
      return LOT;
    default:
      return null;
  }
};
