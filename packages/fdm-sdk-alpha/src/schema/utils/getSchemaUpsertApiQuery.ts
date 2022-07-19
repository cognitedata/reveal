import type { SchemaAPI } from '../types';

export const getSchemaUpsertApiQuery = (
  schema: Omit<SchemaAPI, 'versions'>
): unknown => {
  return {
    query: `
        mutation upsertApi($apis: [ApiCreate!]!) {
          upsertApis(apis: $apis) {
            externalId
            name
          }
        }
      `,
    variables: {
      apis: [schema],
    },
  };
};
