import { useMeasurementsQuery } from 'domain/wells/measurements/internal/queries/useMeasurementsQuery';

import { useMemo } from 'react';

import { DepthMeasurementColumn } from '@cognite/sdk-wells-v3';

import { getUniqOtherCurves } from '../transformers/getUniqOtherCurves';

/**
 * Find unique LOT and FIT measurement types from the available data
 */
export const useOtherFilterOptions = () => {
  const { data } = useMeasurementsQuery();
  return useMemo(() => {
    if (!data) return { types: [] as DepthMeasurementColumn[] };
    return { types: getUniqOtherCurves(data) };
  }, [data]);
};
