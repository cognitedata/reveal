import { useQuery, UseQueryResult } from 'react-query';

import { REPORTS_QUERY_KEY } from 'constants/react-query';

import { reportManagerAPI } from '../../service/network/reportManagerAPI';
import { Report } from '../types';

export const useActiveReportsQuery = (
  externalIds: string[]
): UseQueryResult<Report[]> => {
  return useQuery([REPORTS_QUERY_KEY.ACTIVE_REPORTS, externalIds], () =>
    reportManagerAPI.search({
      status: ['ACTIVE', 'IN_PROGRESS'],
      externalIds,
    })
  );
};
