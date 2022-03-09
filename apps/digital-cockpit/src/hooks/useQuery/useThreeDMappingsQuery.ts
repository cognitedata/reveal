import { useQuery } from 'react-query';
import { AssetMapping3D } from '@cognite/sdk';
import useCDFExplorerContext from 'hooks/useCDFExplorerContext';

import useModelsQuery from './useModelsQuery';
import useRevisionsQuery from './useRevisionsQuery';

const useThreeDMappingsQuery = (assetIds: number[]) => {
  const { client } = useCDFExplorerContext();
  const { data: models, isSuccess: modelsIsSuccess } = useModelsQuery();
  const { data: revisions, isSuccess: revsIsSuccess } = useRevisionsQuery(
    models?.map((m) => m.id)
  );

  const query = useQuery<
    (AssetMapping3D & { modelId: number; revisionId: number })[]
  >(
    ['threeDMappings', assetIds, models, revisions],
    () => {
      const promises = (revisions || []).map((r) =>
        r.revisions.map((rev) =>
          client.assetMappings3D
            .filter(r.modelId, rev.id, { filter: { assetIds } })
            .then((res) => {
              return res.items.map((item) => ({
                ...item,
                modelId: r.modelId,
                revisionId: rev.id,
              }));
            })
        )
      );
      return Promise.all(promises.flat()).then((res) => res.flat());
    },
    {
      enabled: Boolean(assetIds) && modelsIsSuccess && revsIsSuccess,
    }
  );
  return query;
};

export default useThreeDMappingsQuery;
