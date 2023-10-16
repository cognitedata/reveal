import {
  buildClientSchema,
  getIntrospectionQuery,
  GraphQLInputObjectType,
} from 'graphql';

import { PlatypusDmlError, PlatypusError } from '../../../../boundaries/types';
import { IGraphQlSchemaValidator } from '../../boundaries';
import { FlexibleDataModelingClient } from '../../boundaries/fdm-client';
import {
  ConflictMode,
  CreateDataModelTransformationDTO,
  FetchDataModelTransformationsDTO,
  FetchFilteredRowsCountDTO,
  FetchPublishedRowsCountDTO,
  GetByExternalIdDTO,
  IngestInstanceDTO,
  IngestInstancesDTO,
  IngestInstancesResponseDTO,
  ListDataDTO,
  PublishDataModelVersionDTO,
  PublishedRowsCountMap,
  SearchDataDTO,
} from '../../dto';
import {
  MixerQueryBuilder,
  OPERATION_TYPE,
  TransformationApiService,
} from '../../services';
import {
  CdfResourceInstance,
  DataModelTransformation,
  DataModelTypeDefsType,
  DataModelValidationError,
  DataModelVersion,
  PaginatedResponse,
} from '../../types';

import { DataModelVersionDataMapper } from './data-mappers/data-model-version-data-mapper';
import { GraphQlDmlVersionDTO } from './dto/mixer-api-dtos';
import { InstancesApiService } from './services/data-modeling-api/instances-api.service';
import { FdmMixerApiService } from './services/mixer-api';

export class FdmClient implements FlexibleDataModelingClient {
  private dataModelVersionDataMapper: DataModelVersionDataMapper;
  private queryBuilder: MixerQueryBuilder;

  version = 'stable';

  constructor(
    private mixerApiService: FdmMixerApiService,
    private transformationApiService: TransformationApiService,
    private instancesApiService: InstancesApiService,
    private graphQlValidator: IGraphQlSchemaValidator
  ) {
    this.mixerApiService = mixerApiService;
    this.dataModelVersionDataMapper = new DataModelVersionDataMapper();
    this.queryBuilder = new MixerQueryBuilder();
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
    return this.graphQlValidator.validate(graphql).errors;
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
            space: dto.instanceSpace,
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
                  dto.instanceSpace,
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
