import { reportManagerAPI } from 'domain/reportManager/service/network/reportManagerAPI';
import { getWellboresByWellIds } from 'domain/wells/wellbore/service/network/getWellboresByWellId';

import { useCallback } from 'react';

import {
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import uniq from 'lodash/uniq';

import { REPORTS_QUERY_KEY } from 'constants/react-query';

import { normalizeReports } from '../transformers/normalizeReports';
import { Report } from '../types';

export const useReportsQuery = (
  reportIds?: Report['id'][]
): UseQueryResult<Report[]> => {
  return useQuery(
    [REPORTS_QUERY_KEY.ALL, reportIds],
    () =>
      reportManagerAPI
        .search({})
        .then((reports) =>
          getWellboresByWellIds(
            uniq(reports.map((report) => report.externalId))
          ).then((wellbores) => normalizeReports(reports, wellbores))
        ),
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
