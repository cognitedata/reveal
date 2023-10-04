/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { CogniteClient } from '@cognite/sdk';

import { PlatypusError, SdkError } from '../../../../../../boundaries/types';
import {
  GraphQlQueryParams,
  GraphQLQueryResponse,
  RunQueryDTO,
  ValidateDataModelDTO,
} from '../../../../dto';
import {
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
    this.mixerApiPath = `/api/v1/projects/${this.cdfClient.project}/dml/graphql`;
  }

  listDataModelVersions(): Promise<GraphQlDmlVersionDTO[]> {
    const listDataModelsQuery = `
    query listDataModelVersions($limit: Int) {
      listGraphQlDmlVersions(limit: $limit) {
        items {
          ${this.dataModelVersionFields}
          views { externalId version }
        }
      }
    }
    `;

    const reqDto = {
      query: listDataModelsQuery,
      variables: {
        limit: 1000,
      },
    } as GraphQlQueryParams;

    return this.runGraphQlQuery(this.mixerApiPath, reqDto)
      .then((response) => {
        return response.data.data.listGraphQlDmlVersions.items;
      })
      .catch((err) => Promise.reject(PlatypusError.fromSdkError(err)));
  }

  getDataModelVersionsById(
    space: string,
    externalId: string
  ): Promise<GraphQlDmlVersionDTO[]> {
    const query = `
    query getDataModelVersionsById($space:String!, $externalId:String!) {
      graphQlDmlVersionsById(space: $space, externalId: $externalId) {
        items {
          ${this.dataModelVersionFields}
          views { externalId version }
        }
      }
    }
    `;

    const reqDto = {
      query,
      variables: {
        space,
        externalId,
      },
    } as GraphQlQueryParams;

    return this.runGraphQlQuery(this.mixerApiPath, reqDto)
      .then((response) => {
        return response.data.data.graphQlDmlVersionsById.items;
      })
      .catch((err) => Promise.reject(PlatypusError.fromSdkError(err)));
  }

  upsertVersion(
    dataModelVersion: Omit<GraphQlDmlVersionDTO, 'views'>
  ): Promise<UpsertDataModelResult> {
    const dto = {
      query: `
        mutation createUpdateDataModel($dmCreate: GraphQlDmlVersionUpsert!) {
          upsertGraphQlDmlVersion(graphQlDmlVersion: $dmCreate) {
            errors {
              kind
              message
              hint
              location {
                start {
                  line
                  column
                }
              }
            }
            result {
              ${this.dataModelVersionFields}
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
  ): Promise<ValidateDataModelDTO[]> {
    const validateDTO = {
      query: `query ($graphQlDmlVersion: GraphQlDmlVersionUpsert!) {
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
        graphQlDmlVersion: {
          space: dataModelVersion.space,
          externalId: dataModelVersion.externalId,
          version: dataModelVersion.version,
          name: dataModelVersion.name,
          description: dataModelVersion.description,
          graphQlDml: dataModelVersion.graphQlDml,
        },
      },
    } as GraphQlQueryParams;

    // Mixer API retrurns different response DTO depending on their validation
    // sometimes the error is in data and sometimes in errors
    // Also the structure of the actual errors is different as well

    return this.runGraphQlQuery(this.mixerApiPath, validateDTO)
      .then(
        (response) => {
          const returnResponse = response.data.data.validateGraphQlDmlVersion;
          if (!returnResponse.errors) return [];
          return returnResponse;
        },
        (errResponse) => errResponse.errors
      )
      .catch((err) => {
        Promise.reject(PlatypusError.fromSdkError(err));
      });
  }

  async runQuery(dto: RunQueryDTO): Promise<GraphQLQueryResponse> {
    const url = this.getDataModelEndpointUrl(
      dto.space!,
      dto.dataModelId,
      dto.schemaVersion
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
              response.data.errors
                .map((el: { message: string }) => el.message)
                .join('\n')
                .trim() ||
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

  public getDataModelEndpointUrl = (
    space: string,
    dataModelExternalId: string,
    version: string
  ) => {
    return `${this.cdfClient.getBaseUrl()}/api/v1/projects/${
      this.cdfClient.project
    }/userapis/spaces/${space}/datamodels/${dataModelExternalId}/versions/${version}/graphql`;
  };
}
