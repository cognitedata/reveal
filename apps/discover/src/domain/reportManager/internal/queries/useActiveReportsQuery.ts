import { useQuery, UseQueryResult } from 'react-query';

import { REPORTS_QUERY_KEY } from 'constants/react-query';

import { reportManagerAPI } from '../../service/network/reportManagerAPI';
import { Report } from '../types';

import { useReportPermissions } from './useReportPermissions';

export const useActiveReportsQuery = (
  externalIds: string[]
): UseQueryResult<Report[]> => {
  const { canReadReports } = useReportPermissions();

  return useQuery(
    [REPORTS_QUERY_KEY.ACTIVE_REPORTS, externalIds, canReadReports],
    () =>
      reportManagerAPI.search({
        status: ['BACKLOG', 'IN_PROGRESS'],
        externalIds,
      }),
    {
      enabled: canReadReports,
    }
  );
};
