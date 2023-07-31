import { AllCursorsProps } from 'domain/wells/types';

import { useDeepMemo } from 'hooks/useDeep';

import {
  MeasurementsFetchOptions,
  WdlMeasurementType,
} from '../../service/types';
import { filterMudWeightData } from '../selectors/filterMudWeightData';

import { useDepthMeasurementsWithData } from './useDepthMeasurementsWithData';
import { useDepthMeasurementsWithTvdData } from './useDepthMeasurementsWithTvdData';

export const measurementTypes = [
  WdlMeasurementType.MUD_TYPE,
  WdlMeasurementType.MUD_DENSITY,
];

export const useMudWeightMeasurements = ({
  wellboreIds,
  withTvd,
}: AllCursorsProps & MeasurementsFetchOptions) => {
  const hook = withTvd
    ? useDepthMeasurementsWithTvdData
    : useDepthMeasurementsWithData;

  const { data, ...rest } = hook({ wellboreIds, measurementTypes });

  const mudWeightData = useDeepMemo(() => filterMudWeightData(data), [data]);

  return {
    data: mudWeightData,
    ...rest,
  };
};
