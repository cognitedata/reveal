import { CogniteClient } from '@cognite/sdk';

import { createGraphqlPostRequest } from './utils/createGraphqlPostRequest';
import { getSchemaUpsertApiQuery } from './utils/getSchemaUpsertApiQuery';
import { SchemaAPI } from './types';

type CreateVersionResponseError = {
  message: string;
  locations: string[];
  extensions: unknown[];
};
type CreateVersionResponse = {
  errors?: CreateVersionResponseError[];
};
type Response = unknown;

export const createSchema = ({
  client,
  schemaDefinition,
}: {
  client: CogniteClient;
  schemaDefinition: Omit<SchemaAPI, 'versions'>;
}): Promise<Response> => {
  return createGraphqlPostRequest<CreateVersionResponse>(
    client,
    getSchemaUpsertApiQuery({
      externalId: schemaDefinition.externalId,
      name: schemaDefinition.name,
      description: schemaDefinition.description,
    })
  );
};
