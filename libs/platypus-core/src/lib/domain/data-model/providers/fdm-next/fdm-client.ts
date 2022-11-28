import {
  ConflictMode,
  CreateDataModelDTO,
  CreateDataModelTransformationDTO,
  CreateDataModelVersionDTO,
  DeleteDataModelDTO,
  DeleteInstancesDTO,
  FetchDataDTO,
  FetchDataModelDTO,
  FetchDataModelTransformationsDTO,
  FetchDataModelVersionDTO,
  FetchPublishedRowsCountDTO,
  GraphQLQueryResponse,
  IngestInstancesDTO,
  IngestInstancesResponseDTO,
  ListDataModelVersionsDTO,
  PublishedRowsCountMap,
  RunQueryDTO,
  UpdateDataModelDTO,
  PublishDataModelVersionDTO,
} from '../../dto';

import {
  DataModel,
  DataModelTransformation,
  DataModelValidationError,
  DataModelVersion,
  PaginatedResponse,
} from '../../types';

import { FlexibleDataModelingClient } from '../../boundaries/fdm-client';
import { SpacesApiService } from './services/data-modeling-api';
import { SpaceDTO } from './dto/dms-space-dtos';
import { DataModelDTO } from './dto/dms-data-model-dtos';
import { DataModelDataMapper } from './data-mappers';
import { DataUtils } from '../../../../boundaries/utils/data-utils';
import { FdmMixerApiService } from './services/mixer-api';
import { PlatypusError } from '../../../../boundaries/types';
import { DataModelVersionDataMapper } from './data-mappers/data-model-version-data-mapper';
import { MixerQueryBuilder } from '../../services';

export class FdmClient implements FlexibleDataModelingClient {
  private spacesApi: SpacesApiService;
  private mixerApiService: FdmMixerApiService;
  private dataModelDataMapper: DataModelDataMapper;
  private dataModelVersionDataMapper: DataModelVersionDataMapper;
  private queryBuilder: MixerQueryBuilder;

  constructor(
    spacesApi: SpacesApiService,
    mixerApiService: FdmMixerApiService
  ) {
    this.spacesApi = spacesApi;
    this.mixerApiService = mixerApiService;
    this.dataModelDataMapper = new DataModelDataMapper();
    this.dataModelVersionDataMapper = new DataModelVersionDataMapper();
    this.queryBuilder = new MixerQueryBuilder();
  }

  /**
   * Lists the available Data Models
   * @returns
   */
  listDataModels(): Promise<DataModel[]> {
    // by default if no externalId or space is provided
    // mixerApi will return the latest version of all data models (unique data models)
    return this.mixerApiService.listDataModelVersions().then((dataModels) => {
      return dataModels.map((item) =>
        this.dataModelDataMapper.deserialize(item)
      );
    });
  }

  /**
   * List Data Model Versions
   * @param dto
   */
  listDataModelVersions(
    dto: ListDataModelVersionsDTO
  ): Promise<DataModelVersion[]> {
    return this.mixerApiService
      .listDataModelVersions(dto.space, {
        externalId: { eq: dto.externalId },
      })
      .then((results) => {
        if (!results || !results.length) {
          return Promise.reject(
            new PlatypusError(
              `Specified version ${dto.externalId} does not exist!`,
              'NOT_FOUND'
            )
          );
        }

        return results.map((result) =>
          this.dataModelVersionDataMapper.deserialize(result)
        );
      });
  }

  /**
   * Fetch the specified DataModel
   * @param dto FetchDataModelDTO
   * @returns
   */
  fetchDataModel(dto: FetchDataModelDTO): Promise<DataModel> {
    return this.mixerApiService
      .listDataModelVersions(dto.space!, {
        externalId: { eq: dto.dataModelId },
      })
      .then((dataModels) => {
        return this.dataModelDataMapper.deserialize(dataModels[0]);
      });
  }

  /**
   * Fetch data model version details, GraphQL Schema...etc.
   * @param dto
   */
  fetchDataModelVersion(
    dto: FetchDataModelVersionDTO
  ): Promise<DataModelVersion> {
    return this.listDataModelVersions(dto).then((versions) => {
      const version = versions.find(
        (dataModelVerion) =>
          dataModelVerion.version.toString() === dto.version.toString()
      );

      if (!version) {
        return Promise.reject(
          new PlatypusError(
            `Specified version ${dto.version} does not exist!`,
            'NOT_FOUND'
          )
        );
      }

      return version;
    });
  }

  /**
   * Creates new Data Model
   * @param dto CreateDataModelDTO
   */
  createDataModel(dto: CreateDataModelDTO): Promise<DataModel> {
    const space: SpaceDTO = {
      space: dto.externalId || DataUtils.convertToCamelCase(dto.name),
      name: dto.name,
    };

    return new Promise((resolve, reject) => {
      this.spacesApi.upsert([space]).then((response) => {
        const spaceInstance = Array.isArray(response.items)
          ? response.items[0]
          : response.items;

        const dataModelDto: DataModelDTO = {
          space: spaceInstance.space,
          externalId: dto.externalId || DataUtils.convertToCamelCase(dto.name),
          name: dto.name,
          description: dto.description,
          version: '1',
        };

        this.mixerApiService
          .upsertVersion(dataModelDto)
          .then((dataModelResponse) => {
            if (dataModelResponse.errors.length) {
              reject(dataModelResponse.errors);
            } else {
              resolve(
                this.dataModelDataMapper.deserialize(dataModelResponse.result)
              );
            }
          });
      });
    });
  }

  /**
   * Updates Data Model metadata (name, description...etc.)
   * @param dto CreateDataModelDTO
   */
  updateDataModel(dto: UpdateDataModelDTO): Promise<DataModel> {
    throw 'Not implemented';
  }

  /**
   * Publishes new or updates the current data model version
   * depending on the specified conflictMode.
   *
   * @param dataModelVersion - DataModelVersion
   * @param conflictMode - NEW_VERSION | PATCH
   */
  publishDataModelVersion(
    dto: PublishDataModelVersionDTO,
    conflictMode: ConflictMode
  ): Promise<DataModelVersion> {
    return this.mixerApiService.upsertVersion(dto).then((upsertResult) => {
      if (upsertResult.errors.length) {
        return Promise.reject(
          new PlatypusError(
            `An error has occured. Data model was not published.`,
            'SERVER_ERROR'
          )
        );
      }
      return this.dataModelVersionDataMapper.deserialize(upsertResult.result);
    });
  }

  /**
   * Deletes the specified Data Model including all versions
   * And the data related with it.
   */
  deleteDataModel(dto: DeleteDataModelDTO): Promise<unknown> {
    throw 'Not implemented';
  }

  /**
   * Validates Data Model GraphQL.
   * Checks for sytax errors, unsupported features, breaking changes
   * @param dto
   * @param validateBreakingChanges
   */
  validateDataModel(
    dto: CreateDataModelVersionDTO,
    validateBreakingChanges?: boolean
  ): Promise<DataModelValidationError[]> {
    throw 'Not implemented';
  }

  /**
   * Run GraphQL query against a Data Model Version
   * @param dto
   */
  runQuery(dto: RunQueryDTO): Promise<GraphQLQueryResponse> {
    const reqDto: RunQueryDTO = {
      ...dto,
      extras: { ...dto.extras, apiName: dto.dataModelId },
    };

    return this.mixerApiService
      .runQuery(reqDto)
      .catch((err) => Promise.reject(PlatypusError.fromSdkError(err)));
  }

  /**
   * Returns the data as Paginated Response for a type.
   * @param dto
   */
  fetchData(dto: FetchDataDTO): Promise<PaginatedResponse> {
    const {
      cursor,
      hasNextPage,
      limit,
      dataModelType,
      dataModelTypeDefs,
      dataModelId,
      version,
      space,
    } = dto;
    const operationName = this.queryBuilder.getOperationName(
      dataModelType.name
    );
    const query = this.queryBuilder.buildQuery({
      cursor,
      dataModelType,
      dataModelTypeDefs,
      hasNextPage,
      limit,
    });
    return this.mixerApiService
      .runQuery({
        graphQlParams: {
          query,
        },
        dataModelId,
        space,
        schemaVersion: version,
      })
      .then((result) => {
        const response = result.data[operationName];
        return {
          pageInfo: {
            cursor: response.pageInfo ? response.pageInfo.endCursor : undefined,
            hasNextPage: response.pageInfo
              ? response.pageInfo.hasNextPage
              : false,
          },
          items: response.items,
        };
      });
  }

  /**
   * Ingest data model type instances (data).
   * @param dto
   */
  ingestInstances(
    dto: IngestInstancesDTO
  ): Promise<IngestInstancesResponseDTO> {
    throw 'Not implemented';
  }

  /**
   * Deletes Data Model Type Instances (data)
   * @param dto
   */
  deleteInstances(dto: DeleteInstancesDTO): Promise<boolean> {
    throw 'Not implemented';
  }

  /**
   * Returns the transformations created for the specified data model type.
   * @param dto
   */
  getTransformations(
    dto: FetchDataModelTransformationsDTO
  ): Promise<DataModelTransformation[]> {
    throw 'Not implemented';
  }

  createTransformation(
    dto: CreateDataModelTransformationDTO
  ): Promise<DataModelTransformation> {
    throw 'Not implemented';
  }

  /**
   * Fetches the number of published rows by type
   * @param dto
   */
  fetchPublishedRowsCount(
    dto: FetchPublishedRowsCountDTO
  ): Promise<PublishedRowsCountMap> {
    return this.mixerApiService
      .runQuery({
        graphQlParams: {
          query: `query Aggregate {
      ${dto.dataModelTypes
        ?.map(
          (dataModelType) => `
          aggregate${dataModelType.name} {
            items {
              count {
                externalId
              }
            }
          }`
        )
        .join('')}
    }`,
        },
        dataModelId: dto.dataModelId,
        schemaVersion: dto.version,
        space: dto.space,
      })
      .then((res) => {
        const counts: PublishedRowsCountMap = {};
        for (const typeName in res.data || {}) {
          counts[typeName.replace(/aggregate/, '')] =
            res.data[typeName]?.items[0]?.count?.externalId || 0;
        }
        return counts;
      });
  }
}
