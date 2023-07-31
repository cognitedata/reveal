import { useMemo } from 'react';

import keyBy from 'lodash/keyBy';

import { WellboreId } from 'modules/wellSearch/types';

import { useWellInspectSelectedWellbores } from './useWellInspectSelectedWellbores';

export const useWellInspectSelectedWellboresKeyed = (
  filterByIds?: WellboreId[]
) => {
  const wellbores = useWellInspectSelectedWellbores(filterByIds);
  return useMemo(() => keyBy(wellbores, 'matchingId'), [wellbores]);
};
