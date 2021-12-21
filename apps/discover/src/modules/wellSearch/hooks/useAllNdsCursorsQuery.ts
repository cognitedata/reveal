import { Nds } from '@cognite/sdk-wells-v3';

import { WELL_QUERY_KEY } from 'constants/react-query';
import { useArrayCache } from 'hooks/useArrayCache';

import { fetchAllNdsEvents } from '../service/event/ndsFetchAll';
import { groupByWellbore } from '../utils/groupByWellbore';

export interface AllCursorsProps {
  wellboreIds: Set<string>;
}
export const useAllNdsCursorsQuery = ({ wellboreIds }: AllCursorsProps) => {
  return useArrayCache<Nds>({
    key: WELL_QUERY_KEY.NDS_EVENTS_CACHE,
    items: wellboreIds,
    fetchAction: (items: Set<string>, options) =>
      fetchAllNdsEvents({ wellboreIds: items, options }).then((response) =>
        groupByWellbore(response)
      ),
  });
};
