import { useQuery, useQueryClient } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';
import { getProject } from '@cognite/cdf-utilities';

import { getExtpipes } from 'utils/ExtpipesAPI';
import { Extpipe } from 'model/Extpipe';
import { SDKError } from 'model/SDKErrors';

export const useExtpipes = () => {
  const sdk = useSDK();
  const project = getProject();
  const queryClient = useQueryClient();
  return useQuery<Extpipe[], SDKError>(
    ['extpipes', project],
    () => {
      return getExtpipes(sdk, project ?? '');
    },
    {
      onSuccess: (data) => {
        data.forEach((d) => {
          queryClient.setQueryData<Extpipe>(
            ['extpipe', d.id, project],
            (old) => {
              return { ...old, ...d };
            }
          );
        });
      },
    }
  );
};
