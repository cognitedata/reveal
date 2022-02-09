import { SolutionsApiService } from '@platypus/platypus-core';
import { CLICommand } from '@cognite/platypus-cdf-cli/app/common/cli-command';
import Response, {
  DEBUG as _DEBUG,
} from '@cognite/platypus-cdf-cli/app/utils/logger';

import { getCogniteSDKClient } from '@cognite/platypus-cdf-cli/app/utils/cogniteSdk';

const DEBUG = _DEBUG.extend('platypus-cdf-cli:solutions:apiSpec:list');
export class SolutionsApiSpecsListCommand extends CLICommand {
  async execute() {
    const client = getCogniteSDKClient();
    DEBUG('CDF Clint initialized');

    const solutionSchemaApi = new SolutionsApiService(client);
    DEBUG('SolutionsApiService initialized');

    const apiSpecsList = await solutionSchemaApi.listApiSpecs();
    DEBUG(
      'List of api specs retrieved successfully, %o',
      JSON.stringify(apiSpecsList, null, 2)
    );

    Response.success(apiSpecsList.map((api) => api.externalId).join('\n'));
  }
}

export default new SolutionsApiSpecsListCommand(
  'list',
  'List all API Specs for current project',
  []
);
