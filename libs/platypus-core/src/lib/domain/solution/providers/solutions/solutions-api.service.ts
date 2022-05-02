import { CogniteClient } from '@cognite/sdk';
import { PlatypusError, SdkError } from '@platypus-core/boundaries/types';

import {
  ApiSpecDTO,
  GraphQlQueryParams,
  GraphQLQueryResponse,
  RunQueryDTO,
  SolutionApiOutputDTO,
  ApiVersion,
  ApiVersionFromGraphQl,
  SolutionStorageDataModelDTO,
  ListInstancesReqDTO,
  StorageInstanceDTO,
} from '../../dto';

export class SolutionsApiService {
  private schemaServiceBaseUrl: string;
  constructor(private readonly cdfClient: CogniteClient) {
    this.schemaServiceBaseUrl = `/api/v1/projects/${this.cdfClient.project}/schema/graphql`;
  }

  getApisByIds(
    externalId: string,
    includeVersions = true
  ): Promise<SolutionApiOutputDTO[]> {
    const versionsSubquery = `
    versions {
      version
      createdTime
      dataModel {
        graphqlRepresentation
      }
    }`;
    const listVersionsQuery = `
    query {
      getApisByIds(externalIds: ["${externalId}"] ) {
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
        return response.data.data.getApisByIds;
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

  /**
   * Creates or Update API (solution)
   */
  upsertApi(apiSpec: ApiSpecDTO) {
    const reqDto = {
      query: `
        mutation createUpdateApi($apiCreate: ApiCreate!) {
          upsertApis(apis: [$apiCreate]) {
            externalId
            versions {
              version
              dataModel {
                graphqlRepresentation
              }
            }
          }
        }
      `,
      variables: {
        apiCreate: {
          externalId: apiSpec.externalId,
          name: apiSpec.name ? apiSpec.name : apiSpec.externalId,
          description: apiSpec.description,
          // metadata: apiSpec.metadata,
        },
      },
    } as GraphQlQueryParams;
    return this.runGraphQlQuery(this.schemaServiceBaseUrl, reqDto)
      .then((response) => {
        return response.data.data.upsertApis[0];
      })
      .catch((err) => Promise.reject(PlatypusError.fromSdkError(err)));
  }

  /** Publish new API version */
  publishVersion(dto: ApiVersionFromGraphQl): Promise<ApiVersion> {
    return this.upsertApiVersion(dto, 'NEW_VERSION');
  }

  /** Tried to patch the version or throws confict error */
  updateVersion(dto: ApiVersionFromGraphQl): Promise<ApiVersion> {
    return this.upsertApiVersion(dto, 'PATCH');
  }

  deleteApi(externalId: string): Promise<unknown> {
    const deleteDTO = {
      query: `mutation deleteApi($externalId: ID!) {
        deleteApis(externalIds: [$externalId]) {
          externalId
        }
      }`,
      variables: {
        externalId,
      },
    } as GraphQlQueryParams;
    return this.runGraphQlQuery(this.schemaServiceBaseUrl, deleteDTO)
      .then((response) => {
        return response.data.data.deleteApis[0];
      })
      .catch((err) => Promise.reject(PlatypusError.fromSdkError(err)));
  }

  /** List data models for a project */
  listStorage(): Promise<SolutionStorageDataModelDTO[]> {
    return this.runStorageApiRequest('definitions/list', {
      includeInheritedProperties: true,
    }).then((res) => res.items as SolutionStorageDataModelDTO[]);
  }

  /** List data models for a project */
  listStorageInstances(
    payload: ListInstancesReqDTO
  ): Promise<StorageInstanceDTO[]> {
    return this.runStorageApiRequest('instances/list', payload).then(
      (res) => res.items as StorageInstanceDTO[]
    );
  }

  /** Apply a data model for a project. Apply will fail if making incompatible changes. */
  upsertStorage(
    payload: SolutionStorageDataModelDTO[]
  ): Promise<SolutionStorageDataModelDTO[]> {
    return this.runStorageApiRequest('definitions/apply', payload).then(
      (res) => res.items as SolutionStorageDataModelDTO[]
    );
  }

  /** Ingest instances (data) into storage. */
  ingestInstancesIntoStorage(
    payload: StorageInstanceDTO[]
  ): Promise<StorageInstanceDTO[]> {
    return this.runStorageApiRequest('instances/ingest', {
      items: payload,
    }).then((res) => res.items as StorageInstanceDTO[]);
  }

  private upsertApiVersion(
    dto: ApiVersionFromGraphQl,
    conflictMode: string
  ): Promise<ApiVersion> {
    const createApiVersionDTO = {
      apiExternalId: dto.apiExternalId,
      graphQl: dto.graphQl,
      bindings: dto.bindings ? dto.bindings : [],
    } as ApiVersionFromGraphQl;

    if (dto.version) {
      createApiVersionDTO.version = +dto.version;
    }

    const reqDto = {
      query: `
      mutation upsertApiVersion($apiVersion: ApiVersionFromGraphQl!) {
        upsertApiVersionFromGraphQl(
          apiVersion: $apiVersion
        ) {
          version
          createdTime
          dataModel {
            graphqlRepresentation
          }
        }
      }
      `,
      variables: {
        apiVersion: createApiVersionDTO,
        conflictMode: conflictMode,
      },
    } as GraphQlQueryParams;
    return this.runGraphQlQuery(this.schemaServiceBaseUrl, reqDto)
      .then((response) => {
        return response.data.data.upsertApiVersionFromGraphQl;
      })
      .catch((err) => Promise.reject(PlatypusError.fromSdkError(err)));
  }

  async runQuery(dto: RunQueryDTO): Promise<GraphQLQueryResponse> {
    const url = `/api/v1/projects/${this.cdfClient.project}/schema/api/${dto.solutionId}/${dto.schemaVersion}/graphql`;
    return (await this.runGraphQlQuery(url, dto.graphQlParams)).data;
  }

  async runStorageApiRequest(apiPath: string, payload: any): Promise<any> {
    const apiUrl = `/api/v1/projects/${this.cdfClient.project}/datamodelstorage/${apiPath}`;
    return new Promise((resolve, reject) => {
      this.cdfClient
        .post(apiUrl, {
          data: payload,
          headers: {
            'cdf-version': 'alpha',
          },
        })
        .then((response) => {
          if (response.data.errors) {
            reject({ status: 400, errors: [...response.data.errors] });
          } else {
            resolve(response.data);
          }
        })
        .catch((err) => {
          console.error(err);
          reject({ status: 400, errors: [] });
        });
    });
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
            const errorMsg =
              'Something went wrong, we were not able to run your query.';
            reject(this.toSdkError(400, errorMsg, response.data));
          } else {
            resolve(response);
          }
        });
    });
  }

  private transformData(response: GraphQLQueryResponse, path: string): any {
    return response.data.data[path].edges.map((edge: any) => edge.node);
  }

  private toSdkError(
    status: number,
    errorMessage: string,
    error: any
  ): SdkError {
    return {
      status,
      message: errorMessage,
      errorMessage,
      errors: error.errors || [],
    } as SdkError;
  }
}
