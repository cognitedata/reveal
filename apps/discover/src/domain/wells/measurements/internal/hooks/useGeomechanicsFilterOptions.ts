import { useMeasurementsQuery } from 'domain/wells/measurements/internal/queries/useMeasurementsQuery';

import { useMemo } from 'react';

import { getUniqGeomechanicsCurves } from '../transformers/getUniqGeomechanicsCurves';

/**
 * Find unique geomechanics measurement types from the available data
 */
export const useGeomechanicsFilterOptions = () => {
  const { data } = useMeasurementsQuery();
  return useMemo(() => {
    return { curves: getUniqGeomechanicsCurves(data) };
  }, [data]);
};
