import { AllCursorsProps } from 'domain/wells/types';

import { WdlMeasurementType } from '../../service/types';

import { useDepthMeasurementsWithData } from './useDepthMeasurementsWithData';

const measurementTypes = [
  WdlMeasurementType.GEOMECHANNICS,
  WdlMeasurementType.PRESSURE,
  WdlMeasurementType.FIT,
  WdlMeasurementType.LOT,
];

export const useDepthMeasurementsForMeasurementTypes = ({
  wellboreIds,
}: AllCursorsProps) => {
  return useDepthMeasurementsWithData({ wellboreIds, measurementTypes });
};
