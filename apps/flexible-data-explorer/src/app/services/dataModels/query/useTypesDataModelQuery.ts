import { useQuery } from '@tanstack/react-query';

import { useFDM } from '../../../providers/FDMProvider';
import { queryKeys } from '../../queryKeys';

export const useTypesDataModelQuery = () => {
  const client = useFDM();

  return useQuery(
    queryKeys.dataModelTypes(client.getHeaders),
    async () => {
      const model = await client.getDataModelById();
      const schema = client.parseSchema(model?.graphQlDml);

      return schema?.types || [];
    },
    {
      staleTime: Infinity,
      cacheTime: Infinity,
      enabled: client.getHeaders !== undefined,
    }
  );
};
