import { useDeepMemo } from 'hooks/useDeep';

import { getUniqPpfgCurves } from '../utils/getUniqPpfgCurves';

import { useMeasurementsData } from './useMeasurementsData';

/**
 * Find unique ppfg measurement types from the available data
 */
export const usePPFGFilterOptions = () => {
  const { data } = useMeasurementsData();
  return useDeepMemo(() => {
    return { curves: getUniqPpfgCurves(data) };
  }, [data]);
};
