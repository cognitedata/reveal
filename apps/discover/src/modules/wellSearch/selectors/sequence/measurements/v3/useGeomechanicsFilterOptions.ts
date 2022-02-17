import { useMemo } from 'react';

import { useMeasurementsQuery } from 'modules/wellSearch/hooks/useMeasurementsQueryV3';

import { getUniqGeomechanicsCurves } from './utils';

/**
 * Find uniqe geomechanics measurement types from the awailable data
 */
export const useGeomechanicsFilterOptions = () => {
  const { data } = useMeasurementsQuery();
  return useMemo(() => {
    return { curves: getUniqGeomechanicsCurves(data) };
  }, [data]);
};
