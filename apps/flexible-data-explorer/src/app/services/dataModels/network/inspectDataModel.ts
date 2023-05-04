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
export const introspectDataModel = () => {
  const result = query({
    operation: 'allFields',
    fields: [
      'name',
      {
        fields: ['name'],
      },
    ],
    variables: { model: 'test' },
  });

  // return fdmClient.listDataModels<{
  // listGraphQlDmlVersions: { items: DataModelsList[] };
  // }>(result.query, result.variables);
};

//       query Introspection($model: String!) {
//         allFields: __type(name: $model) {
//           name
//           fields {
//             name
//             type {
//               name
//             }
//           }
//         }
//       }
