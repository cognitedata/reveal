import axios from 'axios';
import { useQuery, useQueryClient } from 'react-query';
import sidecar from 'utils/sidecar';

import { getCogniteSDKClient } from '../utils/getCogniteClientSDK';
import { DB_NAME, RESULTS_SCHEMA_TABLE } from '../constants';

import { RESULT_SCHEMA_QUERY_KEY } from './useResultSchemas';

export const useGptResult = (
  docId: number | undefined,
  assetId: number | undefined,
  keys: string[],
  shouldFetch: boolean,
  headers: Record<string, string>
) => {
  const queryClient = useQueryClient();

  return useQuery(
    ['schema', 'gpt3', docId],
    () => {
      return axios({
        method: 'post',
        url: `${sidecar.inspectApiUrl}/api/extract`,
        data: {
          schema: keys,
          file_id: docId || 0,
        },
        headers,
      }).then((response) => {
        return response.data;
      });
    },
    {
      retry: 1,
      enabled: shouldFetch,
      onSuccess: async (data) => {
        // save the result into CDF
        await getCogniteSDKClient().raw.insertRows(
          DB_NAME,
          RESULTS_SCHEMA_TABLE,
          [
            {
              key: String(docId),
              columns: {
                docId,
                assetId,
                responseRaw: data,
                finalSchema: data,
              },
            },
          ]
        );
        queryClient.invalidateQueries(RESULT_SCHEMA_QUERY_KEY);

        return data;
      },
    }
  );
};
