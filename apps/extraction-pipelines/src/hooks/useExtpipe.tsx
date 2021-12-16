import { useQuery } from 'react-query';
import { useAppEnv } from 'hooks/useAppEnv';
import { getExtpipeById } from 'utils/ExtpipesAPI';
import { Extpipe } from 'model/Extpipe';
import { SDKError } from 'model/SDKErrors';
import { useSDK } from '@cognite/sdk-provider'; // eslint-disable-line

export const useExtpipeById = (extpipeId?: number) => {
  const sdk = useSDK();
  const { project } = useAppEnv();
  return useQuery<Extpipe, SDKError>(
    ['extpipe', extpipeId, project],
    () => {
      return getExtpipeById(sdk, extpipeId!, project ?? '');
    },
    {
      enabled: !!extpipeId,
    }
  );
};
