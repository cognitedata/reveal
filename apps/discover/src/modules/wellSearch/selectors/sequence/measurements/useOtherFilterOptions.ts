import { useMemo } from 'react';

import { DepthMeasurementColumn } from '@cognite/sdk-wells-v3';

import { useMeasurementsQuery } from 'modules/wellSearch/hooks/useMeasurementsQuery';

import { getUniqOtherCurves } from './utils';

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
