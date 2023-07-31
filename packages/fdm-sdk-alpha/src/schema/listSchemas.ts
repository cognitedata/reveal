import { CogniteClient } from '@cognite/sdk';

import { getSchemaApiListQuery } from './utils/getSchemaApiListQuery';
import { createGraphqlPostRequest } from './utils/createGraphqlPostRequest';

type Node = {
  node: {
    externalId: string;
  };
};
type SchemaAPIListResponse =
  | {
      data: {
        listApis: {
          edges: Node[];
        };
      };
    }
  | Error;

export const listSchemas = async ({
  client,
}: {
  client: CogniteClient;
}): Promise<SchemaAPIListResponse> => {
  return createGraphqlPostRequest<SchemaAPIListResponse>(
    client,
    getSchemaApiListQuery()
  );
};
