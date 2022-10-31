import { Result } from '../../boundaries/types';
import {
  DmsDeleteNodesRequestDTO,
  DmsIngestNodesItemDTO,
  FetchDataDTO,
  FetchPublishedRowsCountDTO,
  PublishedRowsCountMap,
  UnnormalizedDmsIngestNodesItemDTO,
  UnnormalizedDmsIngestNodesRequestDTO,
} from './dto';
import { MixerQueryBuilder, MixerApiService } from './services/mixer-api';

import { TransformationApiService, DmsApiService } from './services';
import {
  DataModelTypeDefs,
  DataModelTypeDefsType,
  PaginatedResponse,
} from './types';
import { DataModelTransformationCreateDTO } from '../transformation/dto';

export class DataManagementHandler {
  constructor(
    private queryBuilder: MixerQueryBuilder,
    private mixerApiService: MixerApiService,
    private transformationApiService: TransformationApiService,
    private dmsApiService: DmsApiService
  ) {}

  fetchNumberOfPublishedRows(
    dto: Omit<FetchDataDTO, 'cursor' | 'hasNextPage' | 'limit'> & {
      dataModelType: DataModelTypeDefsType | null;
    }
  ): Promise<Result<number>> {
    return new Promise((resolve, reject) =>
      this.mixerApiService
        .runQuery({
          graphQlParams: {
            query: `query Aggregate${dto.dataModelType.name} {
        aggregate${dto.dataModelType.name} {
          items {
            count {
              externalId
            }
          }
        }
      }`,
          },
          dataModelId: dto.dataModelId,
          schemaVersion: dto.version,
        })
        .then((res) => {
          resolve(
            Result.ok(
              res.data[`aggregate${dto.dataModelType.name}`].items[0].count
                .externalId
            )
          );
        })
        .catch((err) => {
          reject(Result.fail(err));
        })
    );
  }

  fetchPublishedRowsCount(
    dto: FetchPublishedRowsCountDTO
  ): Promise<Result<PublishedRowsCountMap>> {
    return new Promise((resolve, reject) =>
      this.mixerApiService
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
        })
        .then((res) => {
          const counts: PublishedRowsCountMap = {};
          for (const typeName in res.data || {}) {
            counts[typeName.replace(/aggregate/, '')] =
              res.data[typeName]?.items[0]?.count?.externalId || 0;
          }
          resolve(Result.ok(counts));
        })
        .catch((err) => {
          reject(Result.fail(err));
        })
    );
  }

  fetchData(dto: FetchDataDTO): Promise<Result<PaginatedResponse>> {
    const {
      cursor,
      hasNextPage,
      limit,
      dataModelType,
      dataModelTypeDefs,
      dataModelId,
      version,
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
    return new Promise((resolve, reject) => {
      this.mixerApiService
        .runQuery({
          graphQlParams: {
            query,
          },
          dataModelId,
          schemaVersion: version,
        })
        .then((result) => {
          const response = result.data[operationName];
          resolve(
            Result.ok({
              pageInfo: {
                cursor: response.pageInfo
                  ? response.pageInfo.endCursor
                  : undefined,
                hasNextPage: response.pageInfo
                  ? response.pageInfo.hasNextPage
                  : false,
              },
              items: response.items,
            })
          );
        })
        .catch((error) => reject(Result.fail(error)));
    });
  }

  getTransformations(params: {
    dataModelExternalId: string;
    typeName: string;
    version: string;
  }) {
    return this.transformationApiService.getTransformationsForType(params);
  }

  createTransformation(dto: DataModelTransformationCreateDTO) {
    return this.transformationApiService.createTransformation(dto);
  }

  deleteData(dto: DmsDeleteNodesRequestDTO): Promise<Result<boolean>> {
    if (!dto.items.length) {
      return Promise.resolve(Result.ok(true));
    }
    return this.dmsApiService
      .deleteNodes(dto)
      .then(() => Result.ok(true))
      .catch((error) => Result.fail(error));
  }

  ingestNodes(
    dto: UnnormalizedDmsIngestNodesRequestDTO,
    dataModelExternalId: string,
    dataModelType: DataModelTypeDefsType,
    dataModelTypeDefs: DataModelTypeDefs
  ) {
    const normalizedDto = {
      spaceExternalId: dto.spaceExternalId,
      model: dto.model,
      overwrite: dto.overwrite,
      items: this.normalizeIngestionItem(
        dto.items,
        dataModelExternalId,
        dataModelType,
        dataModelTypeDefs
      ),
    };
    return this.dmsApiService.ingestNodes(normalizedDto);
  }

  isRelationshipField(
    field: string,
    dataModelType: DataModelTypeDefsType,
    dataModelTypeDefs: DataModelTypeDefs
  ): boolean {
    return this.getRelationshipFields(
      dataModelType,
      dataModelTypeDefs
    ).includes(field);
  }

  /*
Replace relationships with correct ingestion format.
Must be on the format [spaceExternalId, externalId] or null instead of {externalId} or null
*/
  private normalizeIngestionItem(
    items: UnnormalizedDmsIngestNodesItemDTO[],
    dataModelExternalId: string,
    dataModelType: DataModelTypeDefsType,
    dataModelTypeDefs: DataModelTypeDefs
  ): DmsIngestNodesItemDTO[] {
    const relationshipFields = new Set(
      this.getRelationshipFields(dataModelType, dataModelTypeDefs)
    );
    return items.map((item) =>
      Object.fromEntries(
        Object.entries(item).map(([key, value]) => {
          if (
            relationshipFields.has(key) &&
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
  }

  private getRelationshipFields(
    dataModelType: DataModelTypeDefsType,
    dataModelTypeDefs: DataModelTypeDefs
  ): string[] {
    const modelTypeNames = new Set(
      dataModelTypeDefs.types.map((modelTypeDef) => modelTypeDef.name)
    );
    return dataModelType.fields
      .filter((field) => modelTypeNames.has(field.type.name))
      .map((field) => field.name);
  }
}
