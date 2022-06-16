import { Result } from '../../boundaries/types';
import { FetchDataDTO } from './dto';
import { MixerApiQueryBuilderService, MixerApiService } from './services';
import { PaginatedResponse } from './types';

export class DataManagmentHandler {
  constructor(
    private queryBuilder: MixerApiQueryBuilderService,
    private mixerApiService: MixerApiService
  ) {}

  fetchData(dto: FetchDataDTO): Promise<Result<PaginatedResponse>> {
    const { cursor, hasNextPage, limit, dataModelType, dataModelId, version } =
      dto;
    const operationName = this.queryBuilder.getOperationName(
      dataModelType.name
    );
    const query = this.queryBuilder.buildQuery({
      cursor,
      dataModelType,
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
}
