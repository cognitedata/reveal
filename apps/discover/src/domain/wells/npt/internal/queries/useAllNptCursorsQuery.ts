import { Npt } from '@cognite/sdk-wells-v3';

import { WELL_QUERY_KEY } from 'constants/react-query';
import { useArrayCache } from 'hooks/useArrayCache';
import { AllCursorsProps } from 'modules/wellSearch/hooks/useAllNdsCursorsQuery';
import { nptFetchAll } from 'modules/wellSearch/service/event/nptFetchAll';
import { groupByWellbore } from 'modules/wellSearch/utils/groupByWellbore';

export const useAllNptCursorsQuery = ({ wellboreIds }: AllCursorsProps) => {
  return useArrayCache<Npt>({
    key: WELL_QUERY_KEY.NPT_EVENTS_CACHE,
    items: wellboreIds,
    fetchAction: (items: Set<string>, options) =>
      nptFetchAll({ wellboreIds: items, options }).then((response) =>
        groupByWellbore(response)
      ),
  });
};
