import { getWellSDKClient } from 'domain/wells/utils/authenticate';

import { useQuery } from 'react-query';

import { WELL_QUERY_KEY } from 'constants/react-query';

import { getPropertiesFromSummaryCounts } from '../../service/utils/getPropertiesFromSummaryCounts';

export const useNptCodesQuery = () => {
  return useQuery(WELL_QUERY_KEY.NPT_CODES, () =>
    getWellSDKClient().summaries.nptCodes().then(getPropertiesFromSummaryCounts)
  );
};
