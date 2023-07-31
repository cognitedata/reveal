import { reportManagerAPI } from 'domain/reportManager/service/network/reportManagerAPI';

import { useMutation } from '@tanstack/react-query';

import { useAllReportsInvalidate } from '../queries/useReportsQuery';
import { Report } from '../types';

export const useReportCreateMutate = () => {
  const invalidateAllReports = useAllReportsInvalidate();

  return useMutation((data: Report[]) => reportManagerAPI.create(data), {
    onSettled: () => {
      setTimeout(() => invalidateAllReports, 1000);
    },
  });
};
