import { useQuery } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';
import { getProject } from '@cognite/cdf-utilities';
import { getExtpipeById } from 'utils/ExtpipesAPI';
import { Extpipe } from 'model/Extpipe';
import { SDKError } from 'model/SDKErrors';

export const useExtpipeById = (extpipeId?: number) => {
  const sdk = useSDK();
  const project = getProject();
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
