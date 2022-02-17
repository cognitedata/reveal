import { useMemo } from 'react';

import { DepthMeasurementColumn } from '@cognite/sdk-wells-v3';

import { useMeasurementsQuery } from 'modules/wellSearch/hooks/useMeasurementsQueryV3';

import { getUniqOtherCurves } from './utils';

/**
 * Find uniqe LOT and FIT measurement types from the awailable data
 */
export const useOtherFilterOptions = () => {
  const { data } = useMeasurementsQuery();
  return useMemo(() => {
    if (!data) return { types: [] as DepthMeasurementColumn[] };
    return { types: getUniqOtherCurves(data) };
  }, [data]);
};
