import { getCasingSchematics } from 'domain/wells/casings/service/network/getCasingSchematics';
import { groupByWellbore } from 'domain/wells/wellbore/internal/transformers/groupByWellbore';

import { CasingSchematic } from '@cognite/sdk-wells';

import { WELL_QUERY_KEY } from 'constants/react-query';
import { useArrayCache } from 'hooks/useArrayCache';

import { AllCursorsProps } from './useAllNdsCursorsQuery';

export const useAllCasingsQuery = ({ wellboreIds }: AllCursorsProps) => {
  return useArrayCache<CasingSchematic>({
    key: WELL_QUERY_KEY.CASINGS_CACHE,
    items: wellboreIds,
    fetchAction: (items: Set<string>, options) =>
      getCasingSchematics({ wellboreIds: items, options }).then((response) =>
        groupByWellbore(response)
      ),
  });
};
