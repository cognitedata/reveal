import { useQuery } from 'react-query';

import { WELL_QUERY_KEY } from '../../../constants/react-query';
import { mapSummaryCountsToStringArray } from '../../../modules/wellSearch/sdk/utils';

import { getWellSDKClient } from './authenticate';

export const useNptDetailCodesQuery = () => {
  return useQuery(WELL_QUERY_KEY.NPT_DETAIL_CODES, () =>
    getWellSDKClient()
      .summaries.nptDetailCodes()
      .then(mapSummaryCountsToStringArray)
  );
};
