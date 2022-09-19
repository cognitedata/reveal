import { reportManagerAPI } from 'domain/reportManager/service/network/reportManagerAPI';

import { useMutation, useQueryClient } from 'react-query';

import { REPORTS_QUERY_KEY } from 'constants/react-query';

import { Report } from '../types';

type UpdateReport = { id: NonNullable<Report['id']>; report: Partial<Report> };

export const useReportUpdateMutate = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data: UpdateReport) => reportManagerAPI.update(data.id, data.report),
    {
      // When mutate is called:
      onMutate: async (newReport: UpdateReport) => {
        // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
        await queryClient.cancelQueries(REPORTS_QUERY_KEY.ALL);

        // Snapshot the previous value
        const previousData = queryClient.getQueryData<Report[]>(
          REPORTS_QUERY_KEY.ALL
        );

        // Optimistically update to the new value
        if (previousData) {
          const updatedReports = previousData.map((report) => {
            if (report.id === newReport.id) {
              return { ...report, ...newReport.report };
            }

            return report;
          });

          queryClient.setQueryData<Report[]>(
            REPORTS_QUERY_KEY.ALL,
            updatedReports
          );
        }

        return { previousData };
      },
      // If the mutation fails, use the context returned from onMutate to roll back
      onError: (err, variables, context) => {
        if (context?.previousData) {
          queryClient.setQueryData<Report[]>(
            REPORTS_QUERY_KEY.ALL,
            context.previousData
          );
        }
      },
      // Always refetch after error or success:
      // but delay 2000ms for events api to catch up
      onSettled: () => {
        setTimeout(() => {
          queryClient.invalidateQueries(REPORTS_QUERY_KEY.ALL);
        }, 2000);
      },
    }
  );
};
