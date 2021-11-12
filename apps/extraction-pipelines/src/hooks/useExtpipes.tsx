import { useQuery, useQueryClient } from 'react-query';
import { getExtpipes } from 'utils/ExtpipesAPI';
import { useAppEnv } from 'hooks/useAppEnv';
import { Extpipe } from 'model/Extpipe';
import { SDKError } from 'model/SDKErrors';

export const useExtpipes = () => {
  const { project } = useAppEnv();
  const queryClient = useQueryClient();
  return useQuery<Extpipe[], SDKError>(
    ['extpipes', project],
    () => {
      return getExtpipes(project ?? '');
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
