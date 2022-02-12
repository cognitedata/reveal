import { useContext } from 'react';
import { useQuery } from 'react-query';
import { Revision3D } from '@cognite/sdk';
import { CogniteSDKContext } from 'providers/CogniteSDKProvider';

const useRevisionsQuery = (modelIds?: number[]) => {
  const { client } = useContext(CogniteSDKContext);

  const query = useQuery<{ modelId: number; revisions: Revision3D[] }[]>(
    ['allRevisionsForModels', modelIds],
    () => {
      const promises = modelIds!.map(async (modelId) =>
        client.revisions3D.list(modelId, { published: true }).then((res) => ({
          modelId,
          revisions: res.items,
        }))
      );
      return Promise.all(promises);
    },
    {
      enabled: Boolean(modelIds),
    }
  );
  return query;
};

export default useRevisionsQuery;
