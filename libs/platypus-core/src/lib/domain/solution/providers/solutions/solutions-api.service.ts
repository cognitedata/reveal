import { CogniteClient } from '@cognite/sdk';

import { GraphQLQueryResponse, RunQueryDTO } from '../../dto';

export class SolutionsApiService {
  constructor(private readonly cdfClient: CogniteClient) {}

  runQuery(dto: RunQueryDTO): Promise<GraphQLQueryResponse> {
    return this.cdfClient.post(
      `/api/v1/projects/${dto.solutionId}/schema/api/${dto.extras?.apiName}/graphql`,
      {
        data: dto.graphQlParams,
      }
    );
  }
}
