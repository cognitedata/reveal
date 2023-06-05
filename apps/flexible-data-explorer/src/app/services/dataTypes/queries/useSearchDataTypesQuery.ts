import { useQuery } from '@tanstack/react-query';

import { useSearchQueryParams } from '../../../hooks/useParams';
import { useFDM } from '../../../providers/FDMProvider';
import { useTypesDataModelQuery } from '../../dataModels/query/useTypesDataModelQuery';
import { queryKeys } from '../../queryKeys';

export const useSearchDataTypesQuery = () => {
  const client = useFDM();

  const { data } = useTypesDataModelQuery();

  const [query] = useSearchQueryParams();

  return useQuery(
    queryKeys.searchDataTypes(query, client.getHeaders),
    async () => {
      const results = await client.searchDataTypes(query, data);

      return results;
    },
    {
      enabled: !!data,
      // suspense is a broke atm, I will fix the underlying issue later - deep
      suspense: false,
    }
  );
};
