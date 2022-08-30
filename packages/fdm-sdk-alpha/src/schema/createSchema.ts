import { CogniteClient } from '@cognite/sdk';

import { createGraphqlPostRequest } from './utils/createGraphqlPostRequest';
import { getSchemaUpsertApiQuery } from './utils/getSchemaUpsertApiQuery';
import { SchemaAPI } from './types';

type CreateResponseError = {
  message: string;
  locations: string[];
  extensions: unknown[];
};
type CreateResponse = {
  errors?: CreateResponseError[];
};
type Response = CreateResponse | Error;

export const createSchema = ({
  client,
  schemaDefinition,
}: {
  client: CogniteClient;
  schemaDefinition: Omit<SchemaAPI, 'versions'>;
}): Promise<Response> => {
  return createGraphqlPostRequest<CreateResponse>(
    client,
    getSchemaUpsertApiQuery({
      externalId: schemaDefinition.externalId,
      name: schemaDefinition.name,
      description: schemaDefinition.description,
    })
  );
};
