import { useMutation, useQueryClient } from 'react-query';

import { discoverAPI, useJsonHeaders } from 'services/service';
import { handleServiceError } from 'utils/errors';

import { getTenantInfo } from '@cognite/react-container';

import { NPT_LEGEND_KEY } from 'constants/react-query';

import { WellLegendNptType, WellLegendPayload } from '../types';

const useNptLegendMutate = (type: WellLegendNptType) => {
  const queryClient = useQueryClient();
  const headers = useJsonHeaders({}, true);
  const [project] = getTenantInfo();

  return useMutation(
    ({ id, body }: WellLegendPayload) =>
      discoverAPI.well.nptLegend.create(headers, project, type, id, body),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(NPT_LEGEND_KEY.lists(type));
      },
      onError: (error: Error) => {
        return handleServiceError(error);
      },
    }
  );
};

export const useNptLegendCodeMutate = () => {
  return useNptLegendMutate(WellLegendNptType.Code);
};

export const useNptLegendDetailCodeMutate = () => {
  return useNptLegendMutate(WellLegendNptType.DetailCode);
};
