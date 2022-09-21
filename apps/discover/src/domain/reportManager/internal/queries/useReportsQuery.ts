import { reportManagerAPI } from 'domain/reportManager/service/network/reportManagerAPI';

import { useCallback } from 'react';
import { useQuery, useQueryClient, UseQueryResult } from 'react-query';

import { REPORTS_QUERY_KEY } from 'constants/react-query';

import { Report } from '../types';

export const useReportsQuery = (
  reportIds?: Report['id'][]
): UseQueryResult<Report[]> => {
  return useQuery(
    [REPORTS_QUERY_KEY.ALL, reportIds],
    () => reportManagerAPI.search({}),
    {
      select: useCallback<(reports: Report[]) => Report[]>(
        (reports) => {
          if (reportIds?.length) {
            return reports.filter((report) => reportIds.includes(report.id));
          }
          return reports;
        },
        [reportIds]
      ),
    }
  );
};

export const useAllReportsInvalidate = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries([REPORTS_QUERY_KEY.ALL]);
};
