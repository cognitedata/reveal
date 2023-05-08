import { query } from 'gql-query-builder';
import { FDMClient } from '../../FDMClient';

export interface DataModelsList {
  space: string;
  externalId: string;
  version: string;
  name?: string;
  description?: string;
  createdTime?: string | number;
  lastUpdatedTime?: string | number;
}
export const listDataModels = (fdmClient: FDMClient) => {
  const result = query({
    operation: 'listGraphQlDmlVersions',
    fields: [
      {
        items: [
          'space',
          'externalId',
          'version',
          'name',
          'description',
          'createdTime',
          'lastUpdatedTime',
        ],
      },
    ],
    variables: { limit: 100 },
  });

  return fdmClient.listDataModels<{
    listGraphQlDmlVersions: { items: DataModelsList[] };
  }>(result.query, result.variables);
};
