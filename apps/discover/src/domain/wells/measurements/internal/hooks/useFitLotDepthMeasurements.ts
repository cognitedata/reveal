import { AllCursorsProps } from 'domain/wells/types';

import { WdlMeasurementType } from '../../service/types';

import { useDepthMeasurementsWithData } from './useDepthMeasurementsWithData';

const measurementTypes = [WdlMeasurementType.FIT, WdlMeasurementType.LOT];

export const useFitLotDepthMeasurements = ({
  wellboreIds,
}: AllCursorsProps) => {
  return useDepthMeasurementsWithData({ wellboreIds, measurementTypes });
};
