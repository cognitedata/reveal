import { Result } from '../../boundaries/types';
import { FetchDataDTO } from './dto';
import { MixerQueryBuilder, MixerApiService } from './services/mixer-api';

import { TransformationApiService } from './services';
import { DataModelTransformation, PaginatedResponse } from './types';

export class DataManagementHandler {
  constructor(
    private queryBuilder: MixerQueryBuilder,
    private mixerApiService: MixerApiService,
    private transformationApiService: TransformationApiService
  ) {}

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
}
