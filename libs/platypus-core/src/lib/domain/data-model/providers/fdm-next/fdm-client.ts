import {
  ConflictMode,
  CreateDataModelDTO,
  CreateDataModelTransformationDTO,
  DeleteDataModelDTO,
  DeleteInstancesDTO,
  ListDataDTO,
  FetchDataModelDTO,
  FetchDataModelTransformationsDTO,
  FetchDataModelVersionDTO,
  FetchPublishedRowsCountDTO,
  GraphQLQueryResponse,
  IngestInstancesDTO,
  IngestInstancesResponseDTO,
  ListDataModelVersionsDTO,
  PublishDataModelVersionDTO,
  PublishedRowsCountMap,
  RunQueryDTO,
  SearchDataDTO,
  UpdateDataModelDTO,
  GetByExternalIdDTO,
} from '../../dto';

import {
  BuiltInType,
  CdfResourceInstance,
  DataModel,
  DataModelTransformation,
  DataModelValidationError,
  DataModelVersion,
  PaginatedResponse,
  SpaceInstance,
} from '../../types';

import { FlexibleDataModelingClient } from '../../boundaries/fdm-client';
import { SpacesApiService } from './services/data-modeling-api';
import { ListSpacesDTO, SpaceDTO } from './dto/dms-space-dtos';
import { DataModelDTO } from './dto/dms-data-model-dtos';
import { DataModelDataMapper } from './data-mappers';
import { DataUtils } from '../../../../boundaries/utils/data-utils';
import { FdmMixerApiService } from './services/mixer-api';
import { PlatypusDmlError, PlatypusError } from '../../../../boundaries/types';
import { IGraphQlUtilsService } from '../../boundaries';
import { DataModelValidationErrorDataMapper } from '../../services/data-mappers/data-model-validation-error-data-mapper';
import { DataModelVersionDataMapper } from './data-mappers/data-model-version-data-mapper';
import { MixerQueryBuilder, OPERATION_TYPE } from '../../services';
import { GraphQlDmlVersionDTO } from './dto/mixer-api-dtos';
import { compareDataModelVersions } from '../../utils';

export class FdmClient implements FlexibleDataModelingClient {
  private dataModelDataMapper: DataModelDataMapper;
  private validationErrorDataMapper: DataModelValidationErrorDataMapper;
  private dataModelVersionDataMapper: DataModelVersionDataMapper;
  private queryBuilder: MixerQueryBuilder;
  version = 'stable';

  constructor(
    private spacesApi: SpacesApiService,
    private mixerApiService: FdmMixerApiService,
    private graphqlService: IGraphQlUtilsService
  ) {
    this.spacesApi = spacesApi;
    this.mixerApiService = mixerApiService;
    this.dataModelDataMapper = new DataModelDataMapper();
    this.validationErrorDataMapper = new DataModelValidationErrorDataMapper();
    this.dataModelVersionDataMapper = new DataModelVersionDataMapper();
    this.queryBuilder = new MixerQueryBuilder();
  }

  /**
   * Lists the available Data Models
   * @returns
   */
  listDataModels(): Promise<DataModel[]> {
    // mixerApi will return the latest version of all data models (unique data models)
    return this.mixerApiService.listDataModelVersions().then((dataModels) => {
      return dataModels.map((item) =>
        this.dataModelDataMapper.deserialize(item)
      );
    });
  }

  /**
   * List Data Model Versions ordered by createdTime, most recent first
   * @param dto
   */
  listDataModelVersions(
    dto: ListDataModelVersionsDTO
  ): Promise<DataModelVersion[]> {
    return this.mixerApiService
      .getDataModelVersionsById(dto.space!, dto.externalId)
      .then((results) => {
        if (!results || !results.length) {
          return Promise.reject(
            new PlatypusError(
              `Specified version ${dto.externalId} does not exist!`,
              'NOT_FOUND'
            )
          );
        }

        return (
          results
            /*
            With DMS V3, a version 1 of a data model is created with an empty schema when
            the data model is created. We hide this from the user so that they don't see
            a v1 "draft" and a v1 "published" when they first create a data model. We
            hide it by filtering out versions with an empty schema, which in effect will
            be version 1. Once the user adds something to the schema, the version will
            no longer be filtered out.
            */
            .filter((result) => !!result.graphQlDml)
            .map((result) =>
              this.dataModelVersionDataMapper.deserialize(result)
            )
            .sort(compareDataModelVersions)
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
      .getDataModelVersionsById(dto.space, dto.dataModelId)
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
    const dataModelDto: DataModelDTO = {
      space: dto.space || DataUtils.convertToExternalId(dto.name),
      externalId: dto.externalId || DataUtils.convertToExternalId(dto.name),
      name: dto.name,
      description: dto.description,
      version: '1',
    };

    return this.createSpace({
      space: dataModelDto.space,
    })
      .then(() => this.mixerApiService.upsertVersion(dataModelDto))
      .then((dataModelResponse) => {
        if (dataModelResponse.errors?.length) {
          return Promise.reject(dataModelResponse.errors);
        } else {
          return Promise.resolve(
            this.dataModelDataMapper.deserialize(dataModelResponse.result)
          );
        }
      });
  }

  /**
   * Updates Data Model metadata (name, description...etc.)
   * @param dto CreateDataModelDTO
   */
  updateDataModel(dto: UpdateDataModelDTO): Promise<DataModel> {
    if (!dto.space) {
      throw 'space required to update data model with FDM V3';
    }

    if (!dto.version) {
      throw 'version required to update data model with FDM V3';
    }

    const upsertDto: GraphQlDmlVersionDTO = {
      description: dto.description,
      externalId: dto.externalId,
      name: dto.name,
      space: dto.space,
      version: dto.version,
    };

    return this.mixerApiService
      .upsertVersion(upsertDto)
      .then((dataModelResponse) => {
        if (dataModelResponse.errors?.length) {
          return Promise.reject(dataModelResponse.errors);
        } else {
          return Promise.resolve(
            this.dataModelDataMapper.deserialize(dataModelResponse.result)
          );
        }
      });
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
    const createDTO = {
      space: dto.space,
      externalId: dto.externalId,
      version: dto.version,
      graphQlDml: dto.schema,
      name: dto.externalId,
      description: dto.externalId,
    } as GraphQlDmlVersionDTO;
    return this.mixerApiService
      .upsertVersion(createDTO)
      .then((upsertResult) => {
        if (upsertResult.errors?.length) {
          return Promise.reject(
            new PlatypusDmlError(
              `An error has occured. Data model was not published.`,
              upsertResult.errors
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
  async validateDataModel(
    dto: PublishDataModelVersionDTO
  ): Promise<DataModelValidationError[]> {
    // TODO skipping validation while we integrate with V3 Mixer API
    // test needs updating too when this is fixed
    return [];

    const typeDefs = this.graphqlService.parseSchema(dto.schema);

    const validationErrors = await this.mixerApiService.validateVersion({
      space: dto.space,
      externalId: dto.externalId,
      version: dto.version,
      graphQlDml: dto.schema,
      createdTime: dto.createdTime,
      lastUpdatedTime: dto.lastUpdatedTime,
    });

    const dataModelValidationErrors = validationErrors.map((err) =>
      this.validationErrorDataMapper.deserialize(err, typeDefs)
    );

    return dataModelValidationErrors;
  }

  /**
   * Validates Graphql
   * Checks for sytax errors, unsupported features
   * @param graphql
   * @param builtInTypes
   */
  validateGraphql(graphql: string): DataModelValidationError[] {
    return this.graphqlService.validate(graphql, {
      useExtendedSdl: true,
    });
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
  fetchData(dto: ListDataDTO): Promise<PaginatedResponse> {
    const {
      cursor,
      limit,
      dataModelType,
      dataModelTypeDefs,
      dataModelVersion: { externalId, space, version },
      sort,
      nestedLimit,
      filter,
    } = dto;
    const operationName = this.queryBuilder.getOperationName(
      dataModelType.name,
      OPERATION_TYPE.LIST
    );
    const query = this.queryBuilder.buildListQuery({
      cursor,
      dataModelType,
      dataModelTypeDefs,
      limit,
      sort,
      nestedLimit,
      filter,
    });
    return this.mixerApiService
      .runQuery({
        graphQlParams: {
          query,
          variables: {
            filter,
          },
        },
        dataModelId: externalId,
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

  getDataByExternalId(dto: GetByExternalIdDTO): Promise<CdfResourceInstance> {
    const {
      externalId,
      nestedCursors,
      nestedLimit,
      dataModelType,
      dataModelTypeDefs,
      dataModelVersion: { space, version, externalId: dataModelId },
      nestedFilters,
      limitFields,
    } = dto;
    const operationName = this.queryBuilder.getOperationName(
      dataModelType.name,
      OPERATION_TYPE.GET
    );
    const query = this.queryBuilder.buildGetByExternalIdQuery({
      spaceId: space,
      externalId,
      nestedCursors,
      dataModelType,
      dataModelTypeDefs,
      nestedLimit,
      nestedFilters,
      limitFields,
    });
    return this.mixerApiService
      .runQuery({
        graphQlParams: {
          query,
          variables: nestedFilters,
        },
        dataModelId,
        schemaVersion: version,
      })
      .then((result) => {
        const response = result.data[operationName];
        return response.items[0];
      });
  }

  /**
   * Returns the search results from a given query.
   * @param dto
   */
  searchData({
    dataModelVersion: { externalId, version },
    dataModelType,
    dataModelTypeDefs,
    limit,
    filter,
    searchTerm,
  }: SearchDataDTO): Promise<CdfResourceInstance[]> {
    const query = this.queryBuilder.buildSearchQuery({
      dataModelType,
      dataModelTypeDefs,
      filter,
    });

    return this.mixerApiService
      .runQuery({
        graphQlParams: {
          query,
          variables: {
            first: limit,
            query: searchTerm,
            ...(filter ? { filter } : {}),
          },
        },
        dataModelId: externalId,
        schemaVersion: version,
      })
      .then((result) => {
        const operationName = this.queryBuilder.getOperationName(
          dataModelType.name,
          OPERATION_TYPE.SEARCH
        );

        const response = result.data[operationName];
        return response.items;
      })
      .catch((err) => Promise.reject(PlatypusError.fromSdkError(err)));
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
   * Fetch all spaces.
   */
  getSpaces(dto?: ListSpacesDTO): Promise<SpaceInstance[]> {
    return this.spacesApi
      .list(dto)
      .then((response) => Promise.resolve(response.items));
  }

  /**
   * Creates a new space for data models.
   * @param dto
   */
  createSpace(dto: SpaceDTO): Promise<SpaceInstance> {
    return this.spacesApi.upsert([dto]).then((res) => res.items[0]);
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
