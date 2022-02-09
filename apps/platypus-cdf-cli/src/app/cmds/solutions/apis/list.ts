import { SolutionsApiService } from '@platypus/platypus-core';
import { CLICommand } from '@cognite/platypus-cdf-cli/app/common/cli-command';
import Response, {
  DEBUG as _DEBUG,
} from '@cognite/platypus-cdf-cli/app/utils/logger';

import { getCogniteSDKClient } from '@cognite/platypus-cdf-cli/app/utils/cogniteSdk';

const DEBUG = _DEBUG.extend('platypus-cdf-cli:solutions:api:list');
export class SolutionsApisListCommand extends CLICommand {
  async execute() {
    const client = getCogniteSDKClient();
    DEBUG('CDF Clint initialized');

    const solutionSchemaApi = new SolutionsApiService(client);
    DEBUG('SolutionsApiService initialized');

    const apisList = await solutionSchemaApi.listApis();
    DEBUG(
      'List of solution apis retrieved successfully, %o',
      JSON.stringify(apisList, null, 2)
    );

    Response.success(apisList.map((api) => api.externalId).join('\n'));
  }
}

export default new SolutionsApisListCommand(
  'list',
  'List all solutions APIs for current project',
  []
);
