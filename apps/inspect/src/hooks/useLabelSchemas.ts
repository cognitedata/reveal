import { useQuery } from 'react-query';

import { DB_NAME, LABEL_SCHEMA_TABLE } from '../constants';
import { getCogniteSDKClient } from '../utils/getCogniteClientSDK';

export type SchemaResponse = {
  id: string;
  name: string;
  labelExternalId: string;
  keys: string[];
  date: Date;
  onRun: (labelExternalId: string) => void;
};

export const LABEL_SCHEMA_QUERY_KEY = ['schemas', 'label'];

export const useLabelSchemas = () => {
  return useQuery(LABEL_SCHEMA_QUERY_KEY, () => {
    return getCogniteSDKClient()
      .raw.listRows(DB_NAME, LABEL_SCHEMA_TABLE)
      .then((response) => {
        return response.items.map((item) => {
          return {
            id: item.key,
            name: item.columns.name,
            labelExternalId: item.columns.labelExternalId,
            keys: item.columns.keys,
            date: item.lastUpdatedTime,
          } as SchemaResponse;
        });
      });
  });
};
