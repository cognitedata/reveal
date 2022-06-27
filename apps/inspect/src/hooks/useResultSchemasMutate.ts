import { useMutation, useQueryClient } from 'react-query';

import { DB_NAME, RESULTS_SCHEMA_TABLE } from '../constants';
import { getCogniteSDKClient } from '../utils/getCogniteClientSDK';

import {
  ResultSchemaResponseContent,
  RESULT_SCHEMA_QUERY_KEY,
} from './useResultSchemas';

export const useResultSchemaMutation = () => {
  const queryClient = useQueryClient();

  // const storedData = queryClient.getQueriesData([...RESULT_SCHEMA_QUERY_KEY]);

  return useMutation(
    ({
      finalSchema,
      key,
    }: {
      key: number;
    } & ResultSchemaResponseContent) => {
      // console.log('finalSchema', finalSchema);
      // console.log('storedData', storedData);
      // console.log('key', key);

      return getCogniteSDKClient().raw.insertRows(
        DB_NAME,
        RESULTS_SCHEMA_TABLE,
        [
          {
            key: String(key),
            columns: { finalSchema },
          },
        ]
      );
    },
    {
      onSettled: () => {
        queryClient.invalidateQueries(RESULT_SCHEMA_QUERY_KEY);
      },
    }
  );
};
