import { reportManagerAPI } from 'domain/reportManager/service/network/reportManagerAPI';

import { useMutation, useQueryClient } from 'react-query';

import { REPORTS_QUERY_KEY } from 'constants/react-query';

import { Report } from '../types';

export const useReportCreateMutate = () => {
  const queryClient = useQueryClient();

  return useMutation((data: Report[]) => reportManagerAPI.create(data), {
    onSettled: () => {
      setTimeout(() => {
        queryClient.invalidateQueries(REPORTS_QUERY_KEY.ALL);
      }, 2000);
    },
  });
};
