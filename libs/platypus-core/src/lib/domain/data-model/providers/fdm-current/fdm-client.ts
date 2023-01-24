import { DataUtils } from '@platypus-core/boundaries/utils/data-utils';
import { PlatypusError } from '../../../../boundaries/types/platypus-error';
import { IGraphQlUtilsService } from '../../boundaries';
import { FlexibleDataModelingClient } from '../../boundaries/fdm-client';
import {
  ListDataModelVersionsDTO,
  FetchDataModelDTO,
  FetchDataModelVersionDTO,
  CreateDataModelDTO,
  UpdateDataModelDTO,
  ConflictMode,
  DeleteDataModelDTO,
  RunQueryDTO,
  GraphQLQueryResponse,
  ListDataDTO,
  IngestInstancesDTO,
  DeleteInstancesDTO,
  FetchDataModelTransformationsDTO,
  CreateDataModelTransformationDTO,
  FetchPublishedRowsCountDTO,
  PublishedRowsCountMap,
  IngestInstancesResponseDTO,
  PublishDataModelVersionDTO,
  IngestInstanceDTO,
  SearchDataDTO,
  GetByExternalIdDTO,
} from '../../dto';
import { TransformationApiService } from '../../services';
import { DataModelValidationErrorDataMapper } from '../../services/data-mappers/data-model-validation-error-data-mapper';
import {
  DataModel,
  DataModelVersion,
  DataModelValidationError,
  PaginatedResponse,
  DataModelTransformation,
  DataModelTypeDefsType,
  CdfResourceInstance,
  SpaceDTO,
  SpaceInstance,
  BuiltInType,
} from '../../types';
import {
  DataModelDataMapper,
  DataModelVersionDataMapper,
} from './data-mappers';
import {
  ApiVersion,
  ApiVersionFromGraphQl,
  DmsDeleteNodesRequestDTO,
  DmsIngestEdgesItemDTO,
  DmsIngestEdgesRequestDTO,
  DmsIngestNodesItemDTO,
  DmsIngestNodesRequestDTO,
} from './dto';
import { DmsApiService, DmsModelBuilder } from './services/data-model-storage';
import { MixerApiService, MixerBindingsBuilder } from './services/mixer-api';
import { MixerQueryBuilder, OPERATION_TYPE } from '../../services';
import { compareDataModelVersions } from '../../utils';
import { ListSpacesDTO } from '../fdm-next/dto/dms-space-dtos';

export class FdmV2Client implements FlexibleDataModelingClient {
  private dataModelVersionDataMapper: DataModelVersionDataMapper;
  private dataModelDataMapper: DataModelDataMapper;
  private queryBuilder: MixerQueryBuilder;
  private validationErrorDataMapper: DataModelValidationErrorDataMapper;
  private mixerBindingsBuilderService: MixerBindingsBuilder;
  private dmsBuilderService: DmsModelBuilder;
  version = 'beta';

  constructor(
    private mixerApiService: MixerApiService,
    private dmsApiService: DmsApiService,
    private transformationApiService: TransformationApiService,
    private graphqlService: IGraphQlUtilsService
  ) {
    // Internal services, no need to export to the outside world
    this.dataModelVersionDataMapper = new DataModelVersionDataMapper();
    this.dataModelDataMapper = new DataModelDataMapper();
    this.queryBuilder = new MixerQueryBuilder();
    this.validationErrorDataMapper = new DataModelValidationErrorDataMapper();
    this.mixerBindingsBuilderService = new MixerBindingsBuilder();
    this.dmsBuilderService = new DmsModelBuilder();
  }

  /**
   * Lists the available Data Models
   * @returns
   */
  listDataModels(): Promise<DataModel[]> {
    return this.mixerApiService.listApis().then((results) => {
      return results.map((result) =>
        this.dataModelDataMapper.deserialize(result)
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
      .getApisByIds(dto.externalId, true)
      .then((results) => {
        if (!results || !results.length || results.length > 1) {
          return Promise.reject(
            new PlatypusError(
              `Specified version ${dto.externalId} does not exist!`,
              'NOT_FOUND'
            )
          );
        }

        if (!results || !results[0] || !results[0].versions) {
          return [];
        }
        // eslint-disable-next-line
        const versions = results[0].versions!;
        return versions
          .map((version) =>
            this.dataModelVersionDataMapper.deserialize(dto.externalId, version)
          )
          .sort(compareDataModelVersions);
      });
  }

  /**
   * Fetch the specified DataModel
   * @param dto FetchDataModelDTO
   * @returns
   */
  fetchDataModel(dto: FetchDataModelDTO): Promise<DataModel> {
    return this.mixerApiService
      .getApisByIds(dto.dataModelId, false)
      .then((results) => {
        if (!results || !results.length || results.length > 1) {
          return Promise.reject(
            new PlatypusError(
              `Specified version ${dto.dataModelId} does not exist!`,
              'NOT_FOUND'
            )
          );
        }
        return this.dataModelDataMapper.deserialize(results[0]);
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
        (apiSpecVersion) =>
          apiSpecVersion.version.toString() === dto.version.toString()
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
    const externalId =
      dto.externalId || DataUtils.convertToExternalId(dto.name);

    return this.dmsApiService.applySpaces([{ externalId }]).then(async () => {
      const createApiResponse = await this.mixerApiService.upsertApi({
        externalId,
        description: dto.description || '',
        name: dto.name,
        metadata: dto.metadata || {},
      });
      return this.dataModelDataMapper.deserialize(createApiResponse);
    });
  }

  /**
   * Updates Data Model metadata (name, description...etc.)
   * @param dto CreateDataModelDTO
   */
  updateDataModel(dto: UpdateDataModelDTO): Promise<DataModel> {
    return this.mixerApiService
      .upsertApi({
        externalId: dto.externalId,
        description: dto.description || '',
        name: dto.name,
        metadata: dto.metadata || {},
      })
      .then((updateApiResponse) =>
        this.dataModelDataMapper.deserialize(updateApiResponse)
      );
  }

  /**
   * Publishes new or updates the current data model version
   * depending on the specified conflictMode.
   *
   * @param dto - PublishDataModelVersionDTO
   * @param conflictMode - NEW_VERSION | PATCH
   */
  async publishDataModelVersion(
    dto: PublishDataModelVersionDTO,
    conflictMode: ConflictMode
  ): Promise<DataModelVersion> {
    let version: ApiVersion;

    const apiVersionFromGraphQl: ApiVersionFromGraphQl = {
      apiExternalId: dto.externalId,
      bindings: dto.bindings,
      graphQl: dto.schema,
      version: Number(dto.version),
    };

    // if bindings are provided, that would mean that the user is
    // controlling the storage and bindings manually using CLI
    if (dto.bindings) {
      // Patch the API and set new bindings
      version = await this.mixerApiService.publishVersion(
        apiVersionFromGraphQl,
        'PATCH'
      );
      const dataModelVersion = this.dataModelVersionDataMapper.deserialize(
        dto.externalId,
        version
      );

      return dataModelVersion;
    } else {
      // if no bindings are provided then try to autogenerate them
      const typeDefs = this.graphqlService.parseSchema(dto.schema);
      const bindings = this.mixerBindingsBuilderService.build(
        dto.externalId,
        dto,
        typeDefs
      );

      const models = this.dmsBuilderService.build(
        dto.externalId,
        dto,
        typeDefs
      );

      // Hack for now!
      // We need to validate everything first before creating DMS
      // However if we send the bindings in the first call to Mixer API
      // Validation will fail and it will complain that DMS Model Does not exist
      // Solution is first to do MixerAPi validation with empty bindings
      let version = await this.mixerApiService.publishVersion(
        {
          ...apiVersionFromGraphQl,
          bindings: [],
        },
        conflictMode
      );

      // Create DMS models
      await this.dmsApiService.upsertModel(models);

      // Patch the API and set new bindings
      version = await this.mixerApiService.publishVersion(
        {
          ...apiVersionFromGraphQl,
          bindings,
        },
        'PATCH'
      );
      const dataModelVersion = this.dataModelVersionDataMapper.deserialize(
        dto.externalId,
        version
      );
      return dataModelVersion;
    }
  }

  /**
   * Deletes the specified Data Model including all versions
   * And the data related with it.
   */
  deleteDataModel(dto: DeleteDataModelDTO): Promise<unknown> {
    return this.mixerApiService.deleteApi(dto.id);
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
    const typeDefs = this.graphqlService.parseSchema(dto.schema);

    const validationErrors = await this.mixerApiService.validateDataModel(
      {
        apiExternalId: dto.externalId,
        graphQl: dto.schema,
      },
      'PATCH'
    );

    const dataModelErrors = validationErrors.map((err) =>
      this.validationErrorDataMapper.deserialize(err, typeDefs)
    );

    return dataModelErrors;
  }

  /**
   * Validates Graphql
   * Checks for sytax errors, unsupported features
   * @param graphql
   * @param builtInTypes
   */
  validateGraphql(
    graphql: string,
    builtInTypes: BuiltInType[]
  ): DataModelValidationError[] {
    return this.graphqlService.validate(graphql, builtInTypes, {
      useExtendedSdl: false,
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
      dataModelVersion: { externalId, version },
      filter,
      sort,
      nestedLimit,
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
      filter,
      sort,
      nestedLimit,
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

  getDataByExternalId(dto: GetByExternalIdDTO): Promise<CdfResourceInstance> {
    const {
      externalId,
      nestedCursors,
      nestedLimit,
      dataModelType,
      dataModelTypeDefs,
      dataModelVersion: { externalId: dataModelExternalId, version },
      nestedFilters,
      limitFields,
    } = dto;
    const operationName = this.queryBuilder.getOperationName(
      dataModelType.name,
      OPERATION_TYPE.GET
    );
    const query = this.queryBuilder.buildGetByExternalIdQuery({
      spaceId: dataModelExternalId,
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
        dataModelId: dataModelExternalId,
        schemaVersion: version,
      })
      .then((result) => {
        const response = result.data[operationName];
        return response.items[0];
      });
  }

  /**
   * Ingest data model type instances (data).
   * @param dto
   */
  ingestInstances(
    dto: IngestInstancesDTO
  ): Promise<IngestInstancesResponseDTO> {
    if (dto.type === 'node') {
      const normalizedDto: DmsIngestNodesRequestDTO = {
        spaceExternalId: dto.space,
        model: dto.model || [],
        overwrite: dto.overwrite,
        items: normalizeIngestionItem(
          dto.items,
          dto.dataModelExternalId,
          dto.dataModelType
        ),
      };
      return this.dmsApiService.ingestNodes(normalizedDto);
    } else {
      if (!dto.model || dto.model.length !== 2) {
        throw new PlatypusError('Unable to ingest relationships', 'VALIDATION');
      }
      const normalizedDto: DmsIngestEdgesRequestDTO = {
        spaceExternalId: dto.space,
        model: dto.model || [],
        overwrite: dto.overwrite,
        items: normalizeEdgeItem(
          dto.items,
          dto.dataModelExternalId,
          dto.model as [string, string]
        ),
      };
      return this.dmsApiService.ingestEdges(normalizedDto);
    }
  }

  /**
   * Deletes Data Model Type Instances (data)
   * @param dto
   */
  deleteInstances(dto: DeleteInstancesDTO): Promise<void> {
    const normalizedDto: DmsDeleteNodesRequestDTO = {
      spaceExternalId: dto.space,
      items: dto.items,
    };
    if (dto.type === 'node') {
      return this.dmsApiService.deleteNodes(normalizedDto);
    } else {
      return this.dmsApiService.deleteEdges(normalizedDto);
    }
  }

  /**
   * Returns the transformations created for the specified data model type.
   * @param dto
   */
  getTransformations(
    dto: FetchDataModelTransformationsDTO
  ): Promise<DataModelTransformation[]> {
    return this.transformationApiService.getTransformationsForType(dto);
  }

  createTransformation(
    dto: CreateDataModelTransformationDTO
  ): Promise<DataModelTransformation> {
    return this.transformationApiService.createTransformation(dto);
  }

  /**
   * Fetch all spaces.
   */
  getSpaces(dto?: ListSpacesDTO): Promise<SpaceInstance[]> {
    throw 'Not implemented';
  }

  /**
   * Creates a new space for data models.
   * @param dto
   */
  createSpace(dto: SpaceDTO): Promise<SpaceInstance> {
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
/*
Replace relationships with correct ingestion format.
Must be on the format [spaceExternalId, externalId] or null instead of {externalId} or null
*/
const normalizeIngestionItem = (
  items: IngestInstanceDTO[],
  dataModelExternalId: string,
  dataModelType: DataModelTypeDefsType
): DmsIngestNodesItemDTO[] => {
  return items.map((item) =>
    Object.fromEntries(
      Object.entries(item).map(([key, value]) => {
        const fieldType = dataModelType.fields.find(
          (field) => field.name === key
        );
        if (fieldType?.type.custom && fieldType?.type.list) {
          return [key, undefined];
        } else if (
          fieldType?.type.custom &&
          !fieldType?.type.list &&
          value !== null &&
          typeof value === 'object'
        ) {
          const externalId = value.externalId;
          if (externalId === '') {
            return [key, null];
          } else {
            return [key, [dataModelExternalId, externalId]];
          }
        } else {
          return [key, value];
        }
      })
    )
  );
};
/*
Replace relationships with correct ingestion format.
Must be on the format [spaceExternalId, externalId] or null instead of {externalId} or null
*/
const normalizeEdgeItem = (
  items: { startNode: string; endNode: string; externalId: string }[],
  dataModelExternalId: string,
  type: [string, string]
): DmsIngestEdgesItemDTO[] => {
  return items.map((item) => ({
    externalId: item.externalId,
    type,
    startNode: [dataModelExternalId, item.startNode],
    endNode: [dataModelExternalId, item.endNode],
    dummy: '',
  }));
};
