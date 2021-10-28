import { useMemo } from 'react';

import flatten from 'lodash/flatten';

import { MEASUREMENT_CURVE_CONFIG } from 'modules/wellSearch/constants';
import { useMeasurementsQuery } from 'modules/wellSearch/hooks/useMeasurementsQuery';
import { MeasurementType } from 'modules/wellSearch/types';

import { getUniqCurves } from './utils';

export const useGeomechanicsFilterOptions = () => {
  const { data } = useMeasurementsQuery();
  return useMemo(() => {
    if (data) {
      const squences = flatten(Object.values(data)).filter(
        (row) => row.metadata?.dataType === 'geomechanic'
      );
      const curves = getUniqCurves(squences).filter(
        (curve) => MEASUREMENT_CURVE_CONFIG[MeasurementType.geomechanic][curve]
      );
      return { curves };
    }
    return { curves: [] as string[] };
  }, [data]);
};
