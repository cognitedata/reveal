import { useQuery, useQueryClient } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';

import { getExtpipes } from 'utils/ExtpipesAPI';
import { Extpipe } from 'model/Extpipe';
import { SDKError } from 'model/SDKErrors';

export const useExtpipes = () => {
  const sdk = useSDK();
  const queryClient = useQueryClient();
  return useQuery<Extpipe[], SDKError>(
    ['extpipes'],
    () => {
      return getExtpipes(sdk);
    },
    {
      onSuccess: (data) => {
        data.forEach((d) => {
          queryClient.setQueryData<Extpipe>(['extpipe', d.id], (old) => {
            return { ...old, ...d };
          });
        });
      },
    }
  );
};
