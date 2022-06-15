import {
  WellLegendNptType,
  WellLegendPayload,
} from 'domain/wells/legend/internal/types';

import { useMutation, useQueryClient } from 'react-query';

import { handleServiceError } from 'utils/errors';

import { getProjectInfo } from '@cognite/react-container';

import { NPT_LEGEND_KEY } from 'constants/react-query';
import { useJsonHeaders } from 'hooks/useJsonHeaders';

import { nptCreateLegend } from '../../service/network/nptCreateLegend';

const useNptLegendMutate = (type: WellLegendNptType) => {
  const queryClient = useQueryClient();
  const headers = useJsonHeaders({}, true);
  const [project] = getProjectInfo();

  return useMutation(
    ({ id, body }: WellLegendPayload) =>
      nptCreateLegend(headers, project, type, id, body),
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
