import { useMemo } from 'react';

import { getUniqPpfgCurves } from '../utils/getUniqPpfgCurves';

import { useMeasurementsData } from './useMeasurementsData';

/**
 * Find unique ppfg measurement types from the available data
 */
export const usePPFGFilterOptions = () => {
  const { data } = useMeasurementsData();
  return useMemo(() => {
    return { curves: getUniqPpfgCurves(data) };
  }, [data]);
};
