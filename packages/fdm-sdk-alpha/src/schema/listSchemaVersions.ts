import { CogniteClient } from '@cognite/sdk';

import { getSchemaVersionListQuery } from './utils/getSchemaVersionListQuery';
import { createGraphqlPostRequest } from './utils/createGraphqlPostRequest';

type Node = {
  versions: { version: string }[];
  name: string;
  externalId: string;
};
type SchemaAPIListResponse =
  | {
      data: {
        listApis: {
          items: Node[];
        };
      };
    }
  | Error;

export const listSchemaVersions = async ({
  client,
}: {
  client: CogniteClient;
}): Promise<SchemaAPIListResponse> => {
  return createGraphqlPostRequest<SchemaAPIListResponse>(
    client,
    getSchemaVersionListQuery()
  );
};
