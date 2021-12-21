import { Npt } from '@cognite/sdk-wells-v3';

import { WELL_QUERY_KEY } from 'constants/react-query';
import { useArrayCache } from 'hooks/useArrayCache';

import { nptFetchAll } from '../service/event/nptFetchAll';
import { groupByWellbore } from '../utils/groupByWellbore';

import { AllCursorsProps } from './useAllNdsCursorsQuery';

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
