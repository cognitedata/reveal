import type { SchemaAPIVersion } from '../types';

export const getSchemaUpsertApiVersionQuery = (
  apiVersion: SchemaAPIVersion
): unknown => {
  return {
    query: `
        mutation upsertApiVersion($apiVersion: ApiVersionFromGraphQl!) {
          upsertApiVersionFromGraphQl(apiVersion: $apiVersion) {
            version
            dataModel {
              types {
                name
              }
            }
          }
        }
      `,
    variables: {
      apiVersion,
    },
  };
};
