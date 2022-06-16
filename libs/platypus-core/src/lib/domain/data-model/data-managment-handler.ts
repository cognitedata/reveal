import { FetchDataDTO } from './dto';
import { PaginatedResponse } from './types';
import { Result } from '../../boundaries/types';
import {
  IQueryBuilderService,
  IDataModelVersionApiService,
} from './boundaries';

export class DataManagmentHandler {
  constructor(
    private queryBuilder: IQueryBuilderService,
    private solutionSchemaService: IDataModelVersionApiService
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
      this.solutionSchemaService
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
