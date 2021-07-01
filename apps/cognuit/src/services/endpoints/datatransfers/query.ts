import ApiContext from 'contexts/ApiContext';
import APIErrorContext from 'contexts/APIErrorContext';
import { useContext } from 'react';
import { useQuery } from 'react-query';
import { DATATRANSFERS_KEYS } from 'services/configs/queryKeys';
import { CustomError } from 'services/CustomError';
import { useIsTokenAndApiValid } from 'hooks/useIsTokenAndApiValid';
import { RESTTransfersFilter } from 'typings/interfaces';
import { reportException } from '@cognite/react-errors';

const useDataTransfersQuery = ({
  options,
  enabled = true,
}: {
  options: RESTTransfersFilter;
  enabled?: boolean;
}) => {
  const { api } = useContext(ApiContext);
  const { addError, removeError } = useContext(APIErrorContext);

  const isValid = useIsTokenAndApiValid();

  const { data, ...rest } = useQuery(
    [DATATRANSFERS_KEYS.default, options],
    async ({ queryKey }) => {
      const [_key, extractedOptions] = queryKey as [
        string,
        RESTTransfersFilter
      ];

      return api!.datatransfers.get(extractedOptions);
    },
    {
      enabled: enabled && isValid,
      onSuccess: (data) => {
        removeError();
        return data;
      },
      onError: (error: CustomError) => {
        reportException(error);
        addError(error.message, error.status);
      },
    }
  );

  return { data: data || [], ...rest };
};

export { useDataTransfersQuery };
