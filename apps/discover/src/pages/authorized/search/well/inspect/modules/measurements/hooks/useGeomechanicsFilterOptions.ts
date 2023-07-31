import { useDeepMemo } from 'hooks/useDeep';

import { getUniqGeomechanicsCurves } from '../utils/getUniqGeomechanicsCurves';

import { useMeasurementsData } from './useMeasurementsData';

/**
 * Find unique geomechanics measurement types from the available data
 */
export const useGeomechanicsFilterOptions = () => {
  const { data } = useMeasurementsData();
  return useDeepMemo(() => {
    return { curves: getUniqGeomechanicsCurves(data) };
  }, [data]);
};
