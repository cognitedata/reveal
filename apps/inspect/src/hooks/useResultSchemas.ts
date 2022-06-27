import { useQuery } from 'react-query';

import { DB_NAME, RESULTS_SCHEMA_TABLE } from '../constants';
import { getCogniteSDKClient } from '../utils/getCogniteClientSDK';

export type ResultSchemaResponseContent = {
  responseRaw: any;
  finalSchema: any;
};
export type ResultSchemaResponse = {
  docId: number;
  assetId: number;
  schemaId: string;
  date: Date;
} & ResultSchemaResponseContent;

export const RESULT_SCHEMA_QUERY_KEY = ['schemas', 'result'];

export const useResultSchemas = (documentId: number | undefined) => {
  return useQuery(
    [...RESULT_SCHEMA_QUERY_KEY, documentId],
    () => {
      return getCogniteSDKClient()
        .raw.retrieveRow(
          DB_NAME,
          RESULTS_SCHEMA_TABLE,
          String(documentId || '')
        )
        .then((item) => {
          return {
            docId: item.columns.docId,
            assetId: item.columns.assetId,
            schemaId: item.columns.schemaId,
            responseRaw: item.columns.responseRaw,
            finalSchema: item.columns.finalSchema,
            date: item.lastUpdatedTime,
          } as ResultSchemaResponse;
        });
    },
    { enabled: !!documentId, retry: 1 }
  );
};
