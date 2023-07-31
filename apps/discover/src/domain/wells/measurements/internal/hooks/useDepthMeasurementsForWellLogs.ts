import { AllCursorsProps } from 'domain/wells/types';

import { WdlMeasurementType } from '../../service/types';

import { useDepthMeasurementsWithData } from './useDepthMeasurementsWithData';

/**
 * Measurement types to fetch with regard to each graph track.
 * To increase the 3D View performance some filters are commented out temporarily
 */
const measurementTypes = [
  WdlMeasurementType.GAMMA_RAY,
  WdlMeasurementType.CALIPER,
  WdlMeasurementType.DEEP_RESISTIVITY,
  // WdlMeasurementType.MEDIUM_RESISTIVITY,
  // WdlMeasurementType.MICRO_RESISTIVITY,
  // WdlMeasurementType.SHALLOW_RESISTIVITY,
  // WdlMeasurementType.DENSITY,
  // WdlMeasurementType.NEUTRON_POROSITY,
  // WdlMeasurementType.PORE_PRESSURE,
  // WdlMeasurementType.FRACTURE_PRESSURE,
  // WdlMeasurementType.GEOMECHANNICS,
];

export const useDepthMeasurementsForWellLogs = ({
  wellboreIds,
}: AllCursorsProps) => {
  return useDepthMeasurementsWithData({ wellboreIds, measurementTypes });
};
