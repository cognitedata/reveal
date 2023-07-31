import { CogniteClient } from '@cognite/sdk';

import { createGraphqlPostRequest } from './utils/createGraphqlPostRequest';
import { getSchemaUpsertApiVersionQuery } from './utils/getSchemaUpsertApiVersionQuery';
import { SchemaAPIVersion } from './types';

type CreateVersionResponseError = {
  message: string;
  locations: string[];
  extensions: unknown[];
};
type CreateVersionResponse = {
  errors?: CreateVersionResponseError[];
};
type Response = CreateVersionResponse | Error;

export const createSchemaVersion = ({
  client,
  version,
}: {
  client: CogniteClient;
  version: SchemaAPIVersion;
}): Promise<Response> => {
  return createGraphqlPostRequest<CreateVersionResponse>(
    client,
    getSchemaUpsertApiVersionQuery(version)
  );
};
