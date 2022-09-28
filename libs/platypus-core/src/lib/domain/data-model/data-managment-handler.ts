import { Result } from '../../boundaries/types';
import {
  DmsDeleteNodesRequestDTO,
  DmsIngestNodesRequestDTO,
  FetchDataDTO,
} from './dto';
import { MixerQueryBuilder, MixerApiService } from './services/mixer-api';

import { TransformationApiService, DmsApiService } from './services';
import {
  DataModelTransformation,
  DataModelTypeDefsType,
  PaginatedResponse,
} from './types';

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
  getTransformations(type: string, externalId: string) {
    return this.transformationApiService.getTransformationsForType(
      type,
      externalId
    );
  }
  createTransformation(transformation: Omit<DataModelTransformation, 'id'>) {
    return this.transformationApiService.createTransformation(transformation);
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

  ingestNodes(dto: DmsIngestNodesRequestDTO) {
    return this.dmsApiService.ingestNodes(dto);
  }
}
