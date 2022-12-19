import ApiContext from 'contexts/ApiContext';
import APIErrorContext from 'contexts/APIErrorContext';
import { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DATATRANSFERS_KEYS } from 'services/configs/queryKeys';
import { CustomError } from 'services/CustomError';
import { useIsTokenAndApiValid } from 'hooks/useIsTokenAndApiValid';
import { RESTTransfersFilter } from 'typings/interfaces';

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

      return api!.translations.filterTransfers(extractedOptions);
    },
    {
      enabled: enabled && isValid,
      refetchInterval: 30000,
      onSuccess: (data) => {
        removeError();
        return data;
      },
      onError: (error: CustomError) => {
        addError(error.message, error.status);
      },
    }
  );

  return { data: data || [], ...rest };
};

export { useDataTransfersQuery };
