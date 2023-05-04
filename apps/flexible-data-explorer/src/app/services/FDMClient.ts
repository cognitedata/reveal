// This file contains a bare-bones version of
// https://github.com/cognitedata/industry-apps/blob/master/packages/e2e-fdm/src/fdm/fdm-client.ts

import type { CogniteClient } from '@cognite/sdk';

export interface FDMError {
  extensions: { classification: string };
  locations: { column: number; line: number };
  message: string;
}

//https://greenfield.cognitedata.com/api/v1/projects/dss-dev/dml/graphql

/**
 * This class can be used for interactions with CDF
 * You can create your own class that extends from this one
 * and add methods that handle data that is specific to your application.
 */
export class FDMClient {
  private DMS_HEADERS: Record<string, string>;
  protected BASE_URL: string;
  protected client: CogniteClient;

  constructor(client: CogniteClient) {
    this.client = client;
    this.BASE_URL = `${client.getBaseUrl()}/api/v1/projects/${client.project}`;
    this.DMS_HEADERS = { 'cdf-version': 'alpha' };
  }

  private get baseUrlDms(): string {
    return `${this.BASE_URL}/models/instances`;
  }

  private getGraphQLBaseURL(
    space: string,
    dataModel: string,
    version: string
  ): string {
    return `${this.BASE_URL}/userapis/spaces/${space}/datamodels/${dataModel}/versions/${version}/graphql`;
  }

  private get baseUrlDml(): string {
    return `${this.BASE_URL}/dml/graphql`;
  }

  private async performRequest<T>(
    { query, variables }: { query: string; variables?: Record<string, any> },
    {
      space,
      dataModel,
      version,
    }: { space: string; dataModel: string; version: string }
  ): Promise<T> {
    return this.client
      .post<{ data: T; errors: FDMError[] }>(
        this.getGraphQLBaseURL(space, dataModel, version),
        {
          data: {
            query,
            variables,
          },
        }
      )
      .then((res) => {
        if (res.data.errors) {
          const { errors } = res.data;
          throw new Error(
            errors.length > 0
              ? JSON.stringify(errors.map((error) => error.message))
              : 'Error connecting to server'
          );
        }
        return res.data.data;
      });
  }

  // async introspectionQuery(
  //   model: string,
  //   type: 'CUSTOMER' | 'APP' = 'CUSTOMER'
  // ): Promise<IntrospectionQueryField[]> {
  //   // Assigning the function to a const makes it lose 'this' context. .bind() fixes that
  //   const method =
  //     type === 'CUSTOMER'
  //       ? this.customerGraphQL.bind(this)
  //       : this.appGraphQL.bind(this);

  //   return this.method<{
  //     allFields: { fields: { name: string; type: { name: string } }[] };
  //   }>(
  //     gql`
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
  //     `,
  //     { model }
  //   ).then((res) =>
  //     res.allFields.fields.map((field) => ({
  //       field: field.name,
  //       kind: field.type.name,
  //     }))
  //   );
  // }

  public async listDataModels<T>(
    query: string,
    variables: Record<string, any>
  ) {
    return this.client
      .post<{ data: T; errors: FDMError[] }>(this.baseUrlDml, {
        data: {
          query,
          variables,
        },
      })
      .then((result) => {
        return result.data.data;
      });
  }

  public async getInstanceById<T>(
    payload: {
      query: string;
      variables?: Record<string, unknown>;
    },
    headers: {
      space: string;
      dataModel: string;
      version: string;
      dataType: string;
      externalId: string;
    }
  ) {
    return this.performRequest<T>(payload, headers);
  }
}

// public async upsertNodes<T extends { externalId?: string }>(
//   modelName: string,
//   nodes: T[]
// ) {
//   const data = {
//     items: nodes.map(({ externalId, ...properties }) => ({
//       instanceType: 'node',
//       space: this.SPACE_EXTERNAL_ID,
//       externalId,
//       sources: [
//         {
//           source: {
//             type: 'container',
//             space: this.SPACE_EXTERNAL_ID,
//             externalId: modelName,
//           },
//           properties,
//         },
//       ],
//     })),
//   };
//   return this.client.post<{ items: T[] }>(this.baseUrlDms, {
//     data,
//     headers: this.DMS_HEADERS,
//     withCredentials: true,
//   });
// }

// public async deleteNodes(externalIds: string[] | string) {
//   const externalIdsAsArray = Array.isArray(externalIds)
//     ? externalIds
//     : [externalIds];
//   const data = {
//     items: externalIdsAsArray.map((externalId) => ({
//       instanceType: 'node',
//       space: this.SPACE_EXTERNAL_ID,
//       externalId,
//     })),
//   };
//   return this.client.post(`${this.baseUrlDms}/delete`, {
//     data,
//     headers: this.DMS_HEADERS,
//     withCredentials: true,
//   });
// }
