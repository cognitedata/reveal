import { DepthMeasurementDataColumnInternal } from 'domain/wells/measurements/internal/types';

import { useMemo } from 'react';

import isEmpty from 'lodash/isEmpty';

import { getUniqOtherCurves } from '../utils/getUniqOtherCurves';

import { useMeasurementsData } from './useMeasurementsData';

/**
 * Find unique LOT and FIT measurement types from the available data
 */
export const useOtherFilterOptions = () => {
  const { data } = useMeasurementsData();

  return useMemo(() => {
    if (isEmpty(data)) {
      return {
        types: [] as DepthMeasurementDataColumnInternal[],
      };
    }

    return { types: getUniqOtherCurves(data) };
  }, [data]);
};
