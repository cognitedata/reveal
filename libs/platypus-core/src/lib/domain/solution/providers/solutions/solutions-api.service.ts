import { CogniteClient } from '@cognite/sdk';
import { PlatypusError } from '@platypus/platypus-core';

import {
  ApiSpecDTO,
  GraphQlQueryParams,
  GraphQLQueryResponse,
  IngestTableDataDTO,
  RunQueryDTO,
  SolutionApiDTO,
  SolutionApiOutputDTO,
  SolutionApiTableDTO,
} from '../../dto';

export class SolutionsApiService {
  private schemaServiceBaseUrl: string;
  constructor(private readonly cdfClient: CogniteClient) {
    this.schemaServiceBaseUrl = `/api/v1/projects/${this.cdfClient.project}/schema/graphql`;
  }

  listApiSpecs(): Promise<SolutionApiOutputDTO[]> {
    const listVersionsQuery = `
    query {
      listApiSpecs {
        edges {
          node {
            externalId
            name
            description
            createdTime
          }
        }
      }
    }
    `;

    const reqDto = {
      query: listVersionsQuery,
    } as GraphQlQueryParams;

    return this.runGraphQlQuery(this.schemaServiceBaseUrl, reqDto)
      .then((response) => {
        return this.transformData(response, 'listApiSpecs');
      })
      .catch((err) => Promise.reject(PlatypusError.fromSdkError(err)));
  }

  getApiSpecsByIds(
    externalId: string,
    includeVersions = true
  ): Promise<SolutionApiOutputDTO[]> {
    const versionsSubquery = `
    versions {
      version
      createdTime
      graphqlRepresentation
    }`;
    const listVersionsQuery = `
    query {
      getApiSpecsByIds(externalIds: ["${externalId}"] ) {
        externalId
        name
        description
        createdTime
        ${includeVersions ? versionsSubquery : ''}
      }
    }
    `;

    const reqDto = {
      query: listVersionsQuery,
    } as GraphQlQueryParams;

    return this.runGraphQlQuery(this.schemaServiceBaseUrl, reqDto)
      .then((response) => {
        return response.data.data.getApiSpecsByIds;
      })
      .catch((err) => Promise.reject(PlatypusError.fromSdkError(err)));
  }

  listApis(): Promise<SolutionApiOutputDTO[]> {
    const listVersionsQuery = `
    query {
      listApis {
        edges {
          node {
            externalId
            name
            description
            createdTime
          }
        }
      }
    }
    `;

    const reqDto = {
      query: listVersionsQuery,
    } as GraphQlQueryParams;

    return this.runGraphQlQuery(this.schemaServiceBaseUrl, reqDto)
      .then((response) => this.transformData(response, 'listApis'))
      .catch((err) => Promise.reject(PlatypusError.fromSdkError(err)));
  }

  updateApis(apiDto: SolutionApiDTO[]) {
    const reqDto = {
      query: `
        mutation upsertApi($apis: [ApiCreate!]!) {
          upsertApis(apis: $apis) {
            externalId
            apiSpecReference {
              externalId
              version
            }
            bindings {
              targetName
            }
          }
        }
      `,
      variables: {
        apis: apiDto.map((api) => {
          if (!api.name) {
            return { ...api, name: api.externalId };
          } else {
            return api;
          }
        }),
      },
    } as GraphQlQueryParams;
    return this.runGraphQlQuery(this.schemaServiceBaseUrl, reqDto).catch(
      (err) => Promise.reject(PlatypusError.fromSdkError(err))
    );
  }

  async updateTables(tables: SolutionApiTableDTO[]) {
    const url = `/api/v1/projects/${this.cdfClient.project}/schema/tables`;
    const promises = tables.map((table) => {
      return this.cdfClient.post(url, {
        data: table,
      });
    });

    return await Promise.all(promises)
      .then((res) => console.log(res))
      .catch((err) => Promise.reject(PlatypusError.fromSdkError(err)));
  }

  /**
   * Creates API Spec (solution)
   */
  updateApiSpec(apiSpec: ApiSpecDTO) {
    const reqDto = {
      query: `
        mutation createApiSpec($apiCreate: ApiSpecCreate!) {
          upsertApiSpecs(apiSpecs: [$apiCreate]) {
            externalId
            versions {
              version
              graphqlRepresentation
            }
          }
        }
      `,
      variables: {
        apiCreate: {
          externalId: apiSpec.externalId,
          name: apiSpec.name ? apiSpec.name : apiSpec.externalId,
          description: apiSpec.description,
          metadata: apiSpec.metadata,
        },
      },
    } as GraphQlQueryParams;
    return this.runGraphQlQuery(this.schemaServiceBaseUrl, reqDto)
      .then((response) => {
        return response.data.data.upsertApiSpecs[0];
      })
      .catch((err) => Promise.reject(PlatypusError.fromSdkError(err)));
  }

  addApiSpecVersion(externalId: string, graphQl: string) {
    const reqDto = {
      query: `
      mutation addApiSpecVersion($externalId: ID!, $graphQl: String!) {
        addApiSpecRevisionFromGraphQl(
          externalId: $externalId
          graphQl: $graphQl
        ) {
          version
        }
      }
      `,
      variables: {
        externalId,
        graphQl,
      },
    } as GraphQlQueryParams;
    return this.runGraphQlQuery(this.schemaServiceBaseUrl, reqDto)
      .then((response) => {
        return response.data.data.addApiSpecRevisionFromGraphQl;
      })
      .catch((err) => Promise.reject(PlatypusError.fromSdkError(err)));
  }

  ingestData(dto: IngestTableDataDTO) {
    const url = `/api/v1/projects/${this.cdfClient.project}/schema/tables/${dto.externalId}`;

    console.log(`ingesting data for`, JSON.stringify(dto, null, 2));
    return this.cdfClient
      .post(url, {
        data: dto.data,
      })
      .then((res) => {
        console.log(res);
        return res;
      })
      .catch((err) => {
        console.error(err);
        return Promise.reject(PlatypusError.fromSdkError(err));
      });
  }

  async runQuery(dto: RunQueryDTO): Promise<GraphQLQueryResponse> {
    const url = `/api/v1/projects/${dto.solutionId}/schema/api/${dto.extras?.apiName}/graphql`;
    return (await this.runGraphQlQuery(url, dto.graphQlParams)).data;
  }

  private runGraphQlQuery(
    url: string,
    graphQlParams: GraphQlQueryParams
  ): Promise<GraphQLQueryResponse> {
    return new Promise((resolve, reject) => {
      this.cdfClient
        .post(url, {
          data: graphQlParams,
        })
        .then((response) => {
          if (response.data.errors) {
            reject({ status: 400, errors: [...response.data.errors] });
          } else {
            resolve(response);
          }
        });
    });
  }

  private transformData(response: GraphQLQueryResponse, path: string): any {
    return response.data.data[path].edges.map((edge: any) => edge.node);
  }
}
