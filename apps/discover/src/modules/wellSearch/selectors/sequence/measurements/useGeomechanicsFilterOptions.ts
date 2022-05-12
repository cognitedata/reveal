import { useMemo } from 'react';

import { useMeasurementsQuery } from 'modules/wellSearch/hooks/useMeasurementsQueryV3';

import { getUniqGeomechanicsCurves } from './utils';

/**
 * Find unique geomechanics measurement types from the available data
 */
export const useGeomechanicsFilterOptions = () => {
  const { data } = useMeasurementsQuery();
  return useMemo(() => {
    return { curves: getUniqGeomechanicsCurves(data) };
  }, [data]);
};
