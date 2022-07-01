import { useMeasurementsQuery } from 'domain/wells/measurements0/internal/queries/useMeasurementsQuery';

import { useMemo } from 'react';

import { getUniqPpfgCurves } from '../transformers/getUniqPpfgCurves';

/**
 * Find unique ppfg measurement types from the available data
 */
export const usePPFGFilterOptions = () => {
  const { data } = useMeasurementsQuery();
  return useMemo(() => {
    return { curves: getUniqPpfgCurves(data) };
  }, [data]);
};
