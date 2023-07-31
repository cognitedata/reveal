import { AllCursorsProps } from 'domain/wells/types';

import {
  MeasurementsFetchOptions,
  WdlMeasurementType,
} from '../../service/types';

import { useDepthMeasurementsWithData } from './useDepthMeasurementsWithData';
import { useDepthMeasurementsWithTvdData } from './useDepthMeasurementsWithTvdData';

const measurementTypes = [WdlMeasurementType.FIT, WdlMeasurementType.LOT];

export const useFitLotDepthMeasurements = ({
  wellboreIds,
  withTvd,
}: AllCursorsProps & MeasurementsFetchOptions) => {
  const hook = withTvd
    ? useDepthMeasurementsWithTvdData
    : useDepthMeasurementsWithData;

  return hook({ wellboreIds, measurementTypes });
};
