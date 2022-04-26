import { useQuery } from 'react-query';

import { WELL_QUERY_KEY } from '../../../constants/react-query';
import { mapSummaryCountsToStringArray } from '../../../modules/wellSearch/sdk/utils';

import { getWellSDKClient } from './authenticate';

export const useNptCodesQuery = () => {
  return useQuery(WELL_QUERY_KEY.NPT_CODES, () =>
    getWellSDKClient().summaries.nptCodes().then(mapSummaryCountsToStringArray)
  );
};
