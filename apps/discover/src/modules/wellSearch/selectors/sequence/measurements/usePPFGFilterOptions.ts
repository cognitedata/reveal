import { useMemo } from 'react';

import flatten from 'lodash/flatten';

import { MEASUREMENT_CURVE_CONFIG } from 'modules/wellSearch/constants';
import { useMeasurementsQuery } from 'modules/wellSearch/hooks/useMeasurementsQuery';
import { MeasurementType } from 'modules/wellSearch/types';

import { getUniqCurves } from './utils';

export const usePPFGFilterOptions = () => {
  const { data } = useMeasurementsQuery();
  return useMemo(() => {
    if (data) {
      const squences = flatten(Object.values(data)).filter(
        (row) => row.metadata?.dataType === 'ppfg'
      );
      const curves = getUniqCurves(squences).filter(
        (curve) => MEASUREMENT_CURVE_CONFIG[MeasurementType.ppfg][curve]
      );
      return { curves };
    }
    return { curves: [] as string[] };
  }, [data]);
};
