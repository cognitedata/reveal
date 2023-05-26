import { useParams } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

import { FDMClient } from '../../FDMClient';

export const useTypesDataModelQuery = () => {
  const sdk = useSDK();
  const client = new FDMClient(sdk);

  const { space, dataModel, version } = useParams();

  return useQuery(
    ['dataModel', 'types', space, dataModel, version],
    async () => {
      if (!(space && dataModel && version)) {
        return Promise.resolve([]);
      }

      const model = await client.getDataModelById({
        space,
        dataModel,
        version,
      });
      const schema = client.parseSchema(model?.graphQlDml);

      return schema?.types || [];
    },
    {
      staleTime: Infinity,
      cacheTime: Infinity,
      enabled: Boolean(space && dataModel && version),
    }
  );
};
