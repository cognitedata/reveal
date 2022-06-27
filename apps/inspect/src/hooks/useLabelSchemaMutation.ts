import { useMutation, useQueryClient } from 'react-query';
import { v4 as uuid } from 'uuid';

import { DB_NAME, LABEL_SCHEMA_TABLE } from '../constants';
import { getCogniteSDKClient } from '../utils/getCogniteClientSDK';

import { LABEL_SCHEMA_QUERY_KEY } from './useLabelSchemas';

export const useLabelSchemaMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({
      name,
      labelExternalId,
      keys,
    }: {
      name: string;
      labelExternalId: string;
      keys: string[];
    }) => {
      return getCogniteSDKClient().raw.insertRows(DB_NAME, LABEL_SCHEMA_TABLE, [
        {
          key: uuid(),
          columns: { name, labelExternalId, keys },
        },
      ]);
    },
    {
      onSettled: () => {
        queryClient.invalidateQueries(LABEL_SCHEMA_QUERY_KEY);
      },
    }
  );
};
