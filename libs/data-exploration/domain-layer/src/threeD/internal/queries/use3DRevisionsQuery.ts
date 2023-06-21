import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

import { queryKeys } from '../../../queryKeys';
import { getThreeDRevisions } from '../../service';
import { Revision3DWithIndex, RevisionOpts } from '../types';

export const use3DRevisionsQuery = <T = Revision3DWithIndex[]>(
  modelId?: number,
  opts?: Omit<RevisionOpts<T>, 'queryKey' | 'queryFn'>
) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.listThreeDRevisions(modelId),
    () => (modelId ? getThreeDRevisions(sdk, modelId) : []),
    opts
  );
};
