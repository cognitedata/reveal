import { useMemo } from 'react';

import flatten from 'lodash/flatten';
import uniq from 'lodash/uniq';

import { useMeasurementsQuery } from 'modules/wellSearch/hooks/useMeasurementsQuery';

export const useOtherFilterOptions = () => {
  const { data } = useMeasurementsQuery();
  return useMemo(() => {
    if (data) {
      const excludeTypes = ['geomechanic', 'ppfg'];
      const types = flatten(Object.values(data))
        .filter(
          (row) => !excludeTypes.includes(row.metadata?.dataType as string)
        )
        .map((row) => row.metadata?.dataType.toUpperCase() as string);

      return { types: uniq(types) };
    }
    return { types: [] as string[] };
  }, [data]);
};
