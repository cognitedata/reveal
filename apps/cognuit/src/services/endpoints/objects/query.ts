import ApiContext from 'contexts/ApiContext';
import APIErrorContext from 'contexts/APIErrorContext';
import { useIsTokenAndApiValid } from 'hooks/useIsTokenAndApiValid';
import { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { OBJECTS_KEY } from 'services/configs/queryKeys';
import { CustomError } from 'services/CustomError';

const useObjectsSingleObjectQuery = ({
  objectId,
  enabled = true,
}: {
  objectId: number;
  enabled?: boolean;
}) => {
  const { api } = useContext(ApiContext);
  const { addError, removeError } = useContext(APIErrorContext);

  const isValid = useIsTokenAndApiValid();

  const { data, ...rest } = useQuery(
    [OBJECTS_KEY.singleObject, objectId],
    async () => {
      return api!.objects.getSingleObject(objectId);
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

export { useObjectsSingleObjectQuery };
