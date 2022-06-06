import { useQuery } from 'react-query';

import { WELL_QUERY_KEY } from '../../../constants/react-query';
import { getWellSDKClient } from '../../../domain/wells/utils/authenticate';
import { mapSummaryCountsToStringArray } from '../../../modules/wellSearch/sdk/utils';

export const useNptDetailCodesQuery = () => {
  return useQuery(WELL_QUERY_KEY.NPT_DETAIL_CODES, () =>
    getWellSDKClient()
      .summaries.nptDetailCodes()
      .then(mapSummaryCountsToStringArray)
  );
};
