import { useQuery } from 'react-query';
import { useAppEnv } from 'hooks/useAppEnv';
import { getExtpipeById } from 'utils/ExtpipesAPI';
import { Extpipe } from 'model/Extpipe';
import { SDKError } from 'model/SDKErrors';

export const useExtpipeById = (extpipeId?: number) => {
  const { project } = useAppEnv();
  return useQuery<Extpipe, SDKError>(
    ['extpipe', extpipeId, project],
    () => {
      return getExtpipeById(extpipeId!, project ?? '');
    },
    {
      enabled: !!extpipeId,
    }
  );
};
