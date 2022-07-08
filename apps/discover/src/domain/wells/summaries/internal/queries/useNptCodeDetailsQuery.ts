import { getWellSDKClient } from 'domain/wells/utils/authenticate';

import { useQuery } from 'react-query';

import { WELL_QUERY_KEY } from 'constants/react-query';

import { getPropertiesFromSummaryCounts } from '../../service/utils/getPropertiesFromSummaryCounts';

export const useNptCodeDetailsQuery = () => {
  return useQuery(WELL_QUERY_KEY.NPT_DETAIL_CODES, () =>
    getWellSDKClient()
      .summaries.nptCodeDetails()
      .then(getPropertiesFromSummaryCounts)
  );
};
