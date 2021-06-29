import ApiContext from 'contexts/ApiContext';
import APIErrorContext from 'contexts/APIErrorContext';
import { useContext } from 'react';
import { useQuery } from 'react-query';
import { DATATYPES_KEYS } from 'services/configs/queryKeys';
import { CustomError } from 'services/CustomError';
import { useIsTokenAndApiValid } from 'hooks/useIsTokenAndApiValid';

const useDatatypesQuery = ({
  id,
  enabled = true,
}: {
  id?: number;
  enabled?: boolean;
}) => {
  const { api } = useContext(ApiContext);
  const { addError, removeError } = useContext(APIErrorContext);

  const isValid = useIsTokenAndApiValid();

  const { data, ...rest } = useQuery(
    id ? [DATATYPES_KEYS.default, id] : DATATYPES_KEYS.default,
    async () => {
      return api!.datatypes.get(id);
    },
    {
      enabled: enabled && isValid,
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

export { useDatatypesQuery };
