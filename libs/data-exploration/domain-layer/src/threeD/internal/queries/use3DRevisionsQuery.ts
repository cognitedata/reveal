import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

import { Revision3DWithIndex, RevisionOpts } from '../types';

const getRevisionKey = (id?: number) => ['cdf', '3d', 'model', id, 'revisions'];
export const use3DRevisionsQuery = <T = Revision3DWithIndex[]>(
  modelId?: number,
  opts?: Omit<RevisionOpts<T>, 'queryKey' | 'queryFn'>
) => {
  const sdk = useSDK();

  return useQuery(
    getRevisionKey(modelId),
    () =>
      modelId
        ? sdk.revisions3D
            .list(modelId)
            .autoPagingToArray({ limit: -1 })
            .then((res) =>
              res.map((r, rIndex) => ({ ...r, index: res.length - rIndex }))
            )
        : [],
    opts
  );
};
