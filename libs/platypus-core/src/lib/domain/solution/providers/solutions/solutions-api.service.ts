import { CogniteClient } from '@cognite/sdk';

import { GraphQLQueryResponse, RunQueryDTO } from '../../dto';

export class SolutionsApiService {
  constructor(private readonly cdfClient: CogniteClient) {}

  async runQuery(dto: RunQueryDTO): Promise<GraphQLQueryResponse> {
    return (
      await this.cdfClient.post(
        `/api/v1/projects/${dto.solutionId}/schema/api/${dto.extras?.apiName}/graphql`,
        {
          data: dto.graphQlParams,
        }
      )
    ).data;
  }
}
