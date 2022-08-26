import { useFitLotDepthMeasurements } from 'domain/wells/measurements/internal/hooks/useFitLotDepthMeasurements';
import { DepthMeasurementWithData } from 'domain/wells/measurements/internal/types';
import { keyByWellbore } from 'domain/wells/wellbore/internal/transformers/keyByWellbore';

import isEmpty from 'lodash/isEmpty';

import { EMPTY_OBJECT } from 'constants/empty';
import { useDeepMemo } from 'hooks/useDeep';
import { useWellInspectWellboreIds } from 'modules/wellInspect/selectors';

export const useMeasurementsColumnsData = () => {
  const wellboreIds = useWellInspectWellboreIds();

  const { data, isLoading } = useFitLotDepthMeasurements({ wellboreIds });

  return useDeepMemo(() => {
    if (isEmpty(data)) {
      return {
        data: EMPTY_OBJECT as Record<string, DepthMeasurementWithData>,
        isLoading,
      };
    }

    return {
      data: keyByWellbore(data),
      isLoading: false,
    };
  }, [data, isLoading]);
};
