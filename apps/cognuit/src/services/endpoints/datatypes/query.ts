import ApiContext from 'contexts/ApiContext';
import APIErrorContext from 'contexts/APIErrorContext';
import { useContext } from 'react';
import { useQuery } from 'react-query';
import { DATATYPES_KEYS } from 'services/configs/queryKeys';
import { CustomError } from 'services/CustomError';
import { useIsTokenAndApiValid } from 'hooks/useIsTokenAndApiValid';
import { reportException } from '@cognite/react-errors';

const useDatatypesQuery = ({
  id,
  enabled = true,
}: {
  id: number | null;
  enabled?: boolean;
}) => {
  const { api } = useContext(ApiContext);
  const { addError, removeError } = useContext(APIErrorContext);

  const isValid = useIsTokenAndApiValid();

  const { data, ...rest } = useQuery(
    [DATATYPES_KEYS.default, id],
    ({ queryKey }) => {
      const [_key, idKey] = queryKey as [string, number | null];
      return api!.datatypes.get(idKey);
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

export { useDatatypesQuery };
