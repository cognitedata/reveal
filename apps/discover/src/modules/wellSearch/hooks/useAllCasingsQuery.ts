import { CasingSchematic } from '@cognite/sdk-wells-v3';

import { WELL_QUERY_KEY } from 'constants/react-query';
import { useArrayCache } from 'hooks/useArrayCache';

import { casingsFetchAll } from '../service/sequence/casingsFetchAll';
import { groupByWellbore } from '../utils/groupByWellbore';

import { AllCursorsProps } from './useAllNdsCursorsQuery';

export const useAllCasingsQuery = ({ wellboreIds }: AllCursorsProps) => {
  return useArrayCache<CasingSchematic>({
    key: WELL_QUERY_KEY.CASINGS_CACHE,
    items: wellboreIds,
    fetchAction: (items: Set<string>, options) =>
      casingsFetchAll({ wellboreIds: items, options }).then((response) =>
        groupByWellbore(response)
      ),
  });
};
