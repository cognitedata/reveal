import {
  buildClientSchema,
  getIntrospectionQuery,
  GraphQLInputObjectType,
} from 'graphql';
import chunk from 'lodash/chunk';
import uniqBy from 'lodash/uniqBy';

import { PlatypusDmlError, PlatypusError } from '../../../../boundaries/types';
import { DataUtils } from '../../../../boundaries/utils/data-utils';
import { IGraphQlUtilsService } from '../../boundaries';
import { FlexibleDataModelingClient } from '../../boundaries/fdm-client';
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
  DeleteDataModelOutput,
  IngestInstanceDTO,
  FetchFilteredRowsCountDTO,
} from '../../dto';
import {
  MixerQueryBuilder,
  OPERATION_TYPE,
  TransformationApiService,
} from '../../services';
import { DataModelValidationErrorDataMapper } from '../../services/data-mappers/data-model-validation-error-data-mapper';
import {
  CdfResourceInstance,
  DataModel,
  DataModelTransformation,
  DataModelTypeDefsType,
  DataModelValidationError,
  DataModelVersion,
  PaginatedResponse,
  SpaceInstance,
} from '../../types';
import { compareDataModelVersions } from '../../utils';

import { DataModelDataMapper } from './data-mappers';
import { DataModelVersionDataMapper } from './data-mappers/data-model-version-data-mapper';
import { ItemsWithCursor } from './dto/dms-common-dtos';
import { DataModelDTO, DataModelInstanceDTO } from './dto/dms-data-model-dtos';
import { ListSpacesDTO, SpaceDTO } from './dto/dms-space-dtos';
import { GraphQlDmlVersionDTO } from './dto/mixer-api-dtos';
import {
  DataModelsApiService,
  SpacesApiService,
  ContainersApiService,
  ViewsApiService,
} from './services/data-modeling-api';
import { InstancesApiService } from './services/data-modeling-api/instances-api.service';
import { FdmMixerApiService } from './services/mixer-api';

export class FdmClient implements FlexibleDataModelingClient {
  private dataModelDataMapper: DataModelDataMapper;
  private validationErrorDataMapper: DataModelValidationErrorDataMapper;
  private dataModelVersionDataMapper: DataModelVersionDataMapper;
  private queryBuilder: MixerQueryBuilder;
  version = 'stable';

  constructor(
    private spacesApi: SpacesApiService,
    private containersApi: ContainersApiService,
    private viewsApi: ViewsApiService,
    private dataModelsApi: DataModelsApiService,
    private mixerApiService: FdmMixerApiService,
    private graphqlService: IGraphQlUtilsService,
    private transformationApiService: TransformationApiService,
    private instancesApiService: InstancesApiService
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
          return this.spacesApi.getByIds([dto.space!]).then(({ items }) => {
            if (items.length > 0) {
              // space exist, but data model does not
              return Promise.reject(
                new PlatypusError(
                  `Specified data model ${dto.externalId} does not exist!`,
                  'NOT_FOUND'
                )
              );
            } else {
              return Promise.reject(
                new PlatypusError(
                  `Specified space ${dto.space} does not exist!`,
                  'NOT_FOUND'
                )
              );
            }
          });
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
        if (!dataModels.length) {
          return Promise.reject(
            new PlatypusError(
              `Data model with external-id ${dto.dataModelId} does not exist.`,
              'NOT_FOUND',
              404
            )
          );
        }
        return this.dataModelDataMapper.deserialize(
          dataModels.sort(compareDataModelVersions)[0]
        );
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
      ...(dto.graphQlDml && { graphQlDml: dto.graphQlDml }),
    };

    return this.fetchDataModel({
      space: dataModelDto.space,
      dataModelId: dataModelDto.externalId,
    })
      .then(() =>
        Promise.reject(
          new PlatypusError(
            `Could not create data model. Data model with external-id ${dataModelDto.externalId} already exists in space ${dataModelDto.space}`,
            'UNKNOWN'
          )
        )
      )
      .catch((error: PlatypusError) => {
        if (error.type == 'NOT_FOUND') {
          return;
        }
        throw error;
      })
      .then(() =>
        this.createSpace({
          space: dataModelDto.space,
        })
      )
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

    const upsertDto = {
      description: dto.description,
      externalId: dto.externalId,
      name: dto.name,
      space: dto.space,
      version: dto.version,
      graphQlDml: dto.graphQlDml,
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
    _conflictMode: ConflictMode
  ): Promise<DataModelVersion> {
    const createDTO = {
      space: dto.space,
      externalId: dto.externalId,
      version: dto.version,
      previousVersion: dto.previousVersion,
      graphQlDml: dto.schema,
      name: dto.name,
      description: dto.description,
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
  async deleteDataModel(
    dto: DeleteDataModelDTO,
    deleteViews: boolean
  ): Promise<DeleteDataModelOutput> {
    // helper functions
    const convertViewRefToKey = ({
      space,
      externalId,
      version,
    }: {
      space: string;
      externalId: string;
      version: string;
    }) => JSON.stringify({ space, externalId, version });

    const convertKeyToViewRef = (key: string) => {
      return JSON.parse(key) as {
        space: string;
        externalId: string;
        version: string;
      };
    };

    // fetch data model (all versions) (note the disable is because of a false positive)
    // eslint-disable-next-line testing-library/no-await-sync-query
    const { items: dataModelVersions } = await this.dataModelsApi.getByIds({
      items: [{ externalId: dto.externalId, space: dto.space }],
    });

    // identify all views across all versions
    const viewRefsKeys = new Set<string>();
    dataModelVersions.forEach((version) => {
      (version.views || []).forEach((view) =>
        viewRefsKeys.add(convertViewRefToKey(view))
      );
    });

    const allDataModels = await autoPageToArray((cursor) =>
      this.dataModelsApi.list(
        cursor
          ? {
              cursor,
              limit: 100,
            }
          : undefined
      )
    );

    const referencedViews = new Map<string, DataModelDTO[]>();

    allDataModels.forEach((dataModel) => {
      if (
        dataModel.externalId === dto.externalId &&
        dataModel.space === dto.space
      ) {
        // skip if the same data model
        return;
      }
      dataModel.views?.forEach((viewRef) => {
        const key = convertViewRefToKey(viewRef);
        // if another data model contains views that were originally planned to be deleted
        if (viewRefsKeys.delete(key) || referencedViews.has(key)) {
          referencedViews.set(
            key,
            (referencedViews.get(key) || []).concat([dataModel])
          );
        }
      });
    });

    if (deleteViews) {
      const viewRefs = Array.from(viewRefsKeys).map(convertKeyToViewRef);

      // delete all views
      await Promise.all(
        // DMS limit right now is 100
        chunk(viewRefs, 100).map((chunk) => this.viewsApi.delete(chunk))
      );
      // delete all containers
      const containerRefs = uniqBy(viewRefs, (el) =>
        JSON.stringify([el.externalId, el.space])
      );
      await Promise.all(
        chunk(containerRefs, 100).map((chunk) =>
          this.containersApi.delete(
            chunk.map((item) => ({
              externalId: item.externalId,
              space: item.space,
            }))
          )
        )
      );
    }

    // delete all versions of the data model
    await Promise.all(
      chunk(dataModelVersions, 100).map((chunk: DataModelInstanceDTO[]) =>
        this.dataModelsApi.delete({
          items: chunk.map((item: DataModelInstanceDTO) => ({
            space: item.space,
            version: item.version,
            externalId: item.externalId,
          })),
        })
      )
    );

    return {
      success: true,
      // this is the list of views that were kept
      referencedViews: Array.from(referencedViews).map(([key, value]) => ({
        ...convertKeyToViewRef(key),
        dataModels: value,
      })),
    };
  }

  /**
   * Validates Data Model GraphQL.
   * Checks for sytax errors, unsupported features, breaking changes
   * @param dto
   * @param validateBreakingChanges
   */
  async validateDataModel(
    _dto: PublishDataModelVersionDTO
  ): Promise<DataModelValidationError[]> {
    // TODO skipping validation while we integrate with V3 Mixer API
    // test needs updating too when this is fixed
    return [];
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
      dataModelExternalId,
      dataModelSpace,
      dataModelType,
      dataModelTypeDefs,
      externalId,
      instanceSpace,
      limitFields,
      nestedCursors,
      nestedFilters,
      nestedLimit,
      version,
    } = dto;
    const operationName = this.queryBuilder.getOperationName(
      dataModelType.name,
      OPERATION_TYPE.GET
    );
    const query = this.queryBuilder.buildGetByExternalIdQuery({
      spaceId: instanceSpace,
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
        dataModelId: dataModelExternalId,
        graphQlParams: {
          query,
          variables: nestedFilters,
        },
        schemaVersion: version,
        space: dataModelSpace,
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
    dataModelVersion: { externalId, version, space },
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
        space,
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
    if (dto.type === 'node') {
      return this.instancesApiService
        .ingest({
          replace: true,
          items: dto.items.map((item) => ({
            instanceType: 'node',
            space: dto.space,
            externalId: (item as { externalId: string }).externalId,
            sources: [
              {
                source: {
                  type: 'view',
                  space: dto.space,
                  externalId: dto.dataModelType.name,
                  version: dto.version,
                },
                properties: normalizeIngestionItem(
                  item,
                  dto.space,
                  dto.dataModelType
                ),
              },
            ],
          })),
        })
        .then(() => ({ items: dto.items }));
    } else {
      return this.instancesApiService
        .ingest({
          autoCreateEndNodes: true,
          autoCreateStartNodes: true,
          items: dto.items.map((item) => ({
            space: dto.space,
            externalId: item.externalId,
            type: {
              space: dto.space,
              externalId: `${dto.dataModelType.name}.${dto.property}`,
            },
            startNode: {
              space: dto.space,
              externalId: item.startNode,
            },
            endNode: {
              space: dto.space,
              externalId: item.endNode,
            },
          })),
        })
        .then(() => ({ items: dto.items }));
    }
  }

  /**
   * Deletes Data Model Type Instances (data)
   * @param dto
   */
  deleteInstances(dto: DeleteInstancesDTO): Promise<boolean> {
    return this.instancesApiService
      .delete({
        items: dto.items.map((el) => ({
          externalId: el.externalId,
          instanceType: dto.type,
          space: dto.space,
        })),
      })
      .then(({ items }) => {
        if (items.length !== dto.items.length) {
          throw `Only ${items.length}/${dto.items.length} of the selected rows are deleted.`;
        }
        return Promise.resolve(true);
      });
  }

  /**
   * Returns the transformations created for the specified data model type.
   * @param dto
   */
  getTransformations(
    dto: FetchDataModelTransformationsDTO
  ): Promise<DataModelTransformation[]> {
    return Promise.all([
      this.transformationApiService.getTransformationsForType({
        destination: 'nodes',
        space: dto.spaceExternalId,
        instanceSpace: dto.instanceSpaceExternalId,
        typeName: dto.typeName,
        viewVersion: dto.viewVersion,
      }),
      this.transformationApiService.getTransformationsForType({
        destination: 'edges',
        space: dto.spaceExternalId,
        instanceSpace: dto.instanceSpaceExternalId,
        typeName: dto.typeName,
        viewVersion: dto.viewVersion,
      }),
    ]).then((values) => values.flat());
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
    return this.spacesApi.list(dto).then((response) => {
      const sortedSpaces = response.items.sort((a, b) =>
        a.space.localeCompare(b.space)
      );

      return sortedSpaces;
    });
  }

  /**
   * Creates a new space for data models.
   * @param dto
   */
  createSpace(dto: SpaceDTO): Promise<SpaceInstance> {
    return this.spacesApi.upsert([dto]).then((res) => res.items[0]);
  }

  /**
   * Fetches the number of filtered rows by type
   * @param dto
   */
  fetchFilteredRowsCount(dto: FetchFilteredRowsCountDTO): Promise<number> {
    const query = this.queryBuilder.buildAggregateWithFiltersQuery(
      dto.dataModelType.name
    );
    return this.mixerApiService
      .runQuery({
        graphQlParams: {
          query,
          variables: { filter: dto.filter },
        },
        dataModelId: dto.dataModelId,
        schemaVersion: dto.version,
        space: dto.space,
      })
      .then((res) => {
        return (
          res.data[`aggregate${dto.dataModelType.name}`]?.items[0]?.count
            .externalId || 0
        );
      });
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

  getQueryEndpointUrl({
    externalId,
    space,
    version,
  }: {
    externalId: string;
    space: string;
    version: string;
  }) {
    return this.mixerApiService.getDataModelEndpointUrl(
      space,
      externalId,
      version
    );
  }

  async getFilterForType({
    space,
    externalId,
    version,
    typeName,
  }: {
    space: string;
    externalId: string;
    version: string;
    typeName: string;
  }) {
    const a = await this.mixerApiService.runQuery({
      dataModelId: externalId,
      space,
      schemaVersion: version,
      graphQlParams: { query: getIntrospectionQuery() },
    });
    const schema = buildClientSchema(a.data);
    return schema.getType(`_List${typeName}Filter`) as GraphQLInputObjectType;
  }
}
// Recursively fetches a paginated API request towards Cognite
// expects the fetch fn to return `nextCursor` when there is an next page
const autoPageToArray = async <T>(
  fn: (cursor?: string) => Promise<ItemsWithCursor<T>>,
  cursor?: string
): Promise<T[]> => {
  const { items, nextCursor } = await fn(cursor);
  if (nextCursor) {
    return items.concat(await autoPageToArray(fn, nextCursor));
  }
  return items;
};

const RESERVED_KEYWORDS = [
  '__typename',
  'externalId',
  'space',
  'createdTime',
  'lastUpdatedTime',
];

/*
Replace relationships with correct ingestion format.
Must be on the format {space, externalId} or null instead of {externalId} or null
*/
const normalizeIngestionItem = (
  item: IngestInstanceDTO,
  space: string,
  dataModelType: DataModelTypeDefsType
) => {
  return Object.fromEntries(
    Object.entries(item)
      .map(([key, value]: [string, any]) => {
        const fieldType = dataModelType.fields.find(
          (field) => field.name === key
        );
        if (RESERVED_KEYWORDS.includes(key)) {
          // remove if reserved keywords
          return [key, undefined];
        }
        if (fieldType?.type.custom) {
          if (fieldType?.type.list) {
            // remove if list, its a non-direct relationship
            return [key, undefined];
          } else if (value !== null && typeof value === 'object') {
            const externalId = (value as { externalId: string }).externalId;
            if (!externalId) {
              // remove if externalId is empty
              return [key, null];
            } else {
              return [key, { space, externalId }];
            }
          }
        } else if (
          // special case for custom type
          ['TimeSeries', 'File', 'Sequence'].includes(
            fieldType?.type.name || ''
          )
        ) {
          if (
            !fieldType?.type.list &&
            typeof value === 'object' &&
            value !== null &&
            'externalId' in value
          ) {
            return [key, value.externalId];
          } else if (
            fieldType?.type.list &&
            typeof value === 'object' &&
            value !== null &&
            Array.isArray(value)
          ) {
            return [key, value.map((el: any) => el.externalId)];
          }
        }
        if (value === '' && fieldType?.type.name !== 'String') {
          return [key, null];
        }
        return [key, value];
      })
      .filter(([_key, val]) => val !== undefined)
  );
};
