import map from 'lodash/map';

import { useDeepMemo } from 'hooks/useDeep';

import { useWellInspectSelectedWellbores } from './useWellInspectSelectedWellbores';

export const useWellInspectSelectedWellboreIds = () => {
  const wellbores = useWellInspectSelectedWellbores();
  return useDeepMemo(() => map(wellbores, 'id'), [wellbores]);
};
