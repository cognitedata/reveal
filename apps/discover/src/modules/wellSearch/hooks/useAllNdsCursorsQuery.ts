import { getNdsEvents } from 'domain/wells/nds/service/network/getNdsEvents';
import { groupByWellbore } from 'domain/wells/wellbore/internal/transformers/groupByWellbore';

import { Nds } from '@cognite/sdk-wells-v3';

import { WELL_QUERY_KEY } from 'constants/react-query';
import { useArrayCache } from 'hooks/useArrayCache';

export interface AllCursorsProps {
  wellboreIds: Set<string>;
}
export const useAllNdsCursorsQuery = ({ wellboreIds }: AllCursorsProps) => {
  return useArrayCache<Nds>({
    key: WELL_QUERY_KEY.NDS_EVENTS_CACHE,
    items: wellboreIds,
    fetchAction: (items: Set<string>, options) =>
      getNdsEvents({ wellboreIds: items, options }).then((response) =>
        groupByWellbore(response)
      ),
  });
};
