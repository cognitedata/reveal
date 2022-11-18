/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { CogniteClient } from '@cognite/sdk';
import {
  KeyValueMap,
  PlatypusError,
  SdkError,
} from '@platypus-core/boundaries/types';
import {
  GraphQlQueryParams,
  GraphQLQueryResponse,
  RunQueryDTO,
} from '../../../../dto';
import {
  DataModelVersionFilter,
  DataModelVersionSort,
  GraphQlDmlVersionDTO,
  UpsertDataModelResult,
} from '../../dto/mixer-api-dtos';

export class FdmMixerApiService {
  private mixerApiPath: string;
  private dataModelVersionFields = `
  space
  externalId
  version
  name
  description
  graphQlDml
  createdTime
  lastUpdatedTime
  `;
  constructor(private readonly cdfClient: CogniteClient) {
    this.mixerApiPath = `/api/v1/projects/${this.cdfClient.project}/schema/graphql`;
  }

  listDataModelVersions(
    space?: string,
    filter?: DataModelVersionFilter,
    sort?: DataModelVersionSort
  ): Promise<GraphQlDmlVersionDTO[]> {
    let dataModelsFromSpaceFilter = '';
    const queryVariables = {} as KeyValueMap;

    if (space || filter) {
      const filters = [];

      if (space) {
        filters.push(`space: "${space}"`);
      }
      if (filter) {
        queryVariables['filter'] = filter;
        filters.push(`filter: $filter`);
      }

      dataModelsFromSpaceFilter = filters.length
        ? `(${filters.join(',')})`
        : '';
    }

    const listDataModelsQuery = `
    query ${
      Object.keys(queryVariables).length
        ? `($filter: GraphQlDmlVersionFilter)`
        : ''
    } {
      listGraphQlDmlVersions${dataModelsFromSpaceFilter} {
        ${this.dataModelVersionFields}
      }
    }
    `;

    const reqDto = {
      query: listDataModelsQuery,
      variables: queryVariables,
    } as GraphQlQueryParams;

    return this.runGraphQlQuery(this.mixerApiPath, reqDto)
      .then((response) => {
        return response.data.data.listGraphQlDmlVersions;
      })
      .catch((err) => Promise.reject(PlatypusError.fromSdkError(err)));
  }

  upsertVersion(
    dataModelVersion: GraphQlDmlVersionDTO
  ): Promise<UpsertDataModelResult> {
    const dto = {
      query: `
        mutation createUpdateDataModel($dmCreate: GraphQlDmlVersionUpsert!) {
          upsertGraphQlDmlVersion(graphQlDmlVersion: $dmCreate) {
            errors {
              message
            }
            result {
              externalId
              version
              graphQlDml
            }
          }
        }
      `,
      variables: {
        dmCreate: dataModelVersion,
      },
    } as GraphQlQueryParams;

    return this.runGraphQlQuery(this.mixerApiPath, dto)
      .then((response) => {
        return response.data.data.upsertGraphQlDmlVersion;
      })
      .catch((err) => Promise.reject(PlatypusError.fromSdkError(err)));
  }

  validateVersion(
    dataModelVersion: GraphQlDmlVersionDTO
  ): Promise<UpsertDataModelResult> {
    const validateDTO = {
      query: `query ($graphQlDmlVersion) {
        validateGraphQlDmlVersion(graphQlDmlVersion: $graphQlDmlVersion) {
          errors {
            message
          }
          result {
            ${this.dataModelVersionFields}
          }
        }
      }`,
      variables: {
        graphQlDmlVersion: dataModelVersion,
      },
    } as GraphQlQueryParams;

    // Mixer API retrurns different response DTO depending on their validation
    // sometimes the error is in data and sometimes in errors
    // Also the structure of the actual errors is different as well

    return this.runGraphQlQuery(this.mixerApiPath, validateDTO)
      .then((response) => response.data.data.validateGraphQlDmlVersion)
      .catch((err) => {
        Promise.reject(PlatypusError.fromSdkError(err));
      });
  }

  async runQuery(dto: RunQueryDTO): Promise<GraphQLQueryResponse> {
    const url = this.getDataModelEndpointUrl(
      this.cdfClient.project,
      dto.space!,
      dto.dataModelId,
      dto.schemaVersion,
      this.cdfClient.getBaseUrl()
    );
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
            const errorMsg =
              'Something went wrong, we were not able to run your query.';
            reject(this.toSdkError(400, errorMsg, response.data));
          } else {
            resolve(response);
          }
        });
    });
  }

  private toSdkError(
    status: number,
    errorMessage: string,
    // eslint-disable-next-line
    error: any
  ): SdkError {
    return {
      status,
      message: errorMessage,
      errorMessage,
      errors: error.errors || [],
    } as SdkError;
  }

  private getDataModelEndpointUrl = (
    projectName: string,
    space: string,
    dataModelExternalId: string,
    version: string,
    baseUrl: string
  ) => {
    return `${baseUrl}/api/v1/projects/${projectName}/schema/api/${space}/${dataModelExternalId}/${version}/graphql`;
  };
}
